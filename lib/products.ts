import { supabase } from './supabase'
import { createServerClient } from './supabase-server'
import {
  type Product,
  type ProductRow,
  type ProductMediaRow,
  type ProductReview,
  type ProductReviewRow,
  rowToProduct,
  rowToProductReview,
} from '@/types'
import { PRODUCTS_REVALIDATE_SECONDS } from './constants'

// ─── Public reads (uses anon client, cached by Next.js ISR) ──────

async function fetchMediaFor(productIds: string[]): Promise<Map<string, ProductMediaRow[]>> {
  if (productIds.length === 0) return new Map()
  const { data, error } = await supabase
    .from('product_media')
    .select('*')
    .in('product_id', productIds)
    .order('position', { ascending: true })

  const byProduct = new Map<string, ProductMediaRow[]>()
  if (error || !data) return byProduct
  for (const row of data as ProductMediaRow[]) {
    const list = byProduct.get(row.product_id) ?? []
    list.push(row)
    byProduct.set(row.product_id, list)
  }
  return byProduct
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  const rows = data as ProductRow[]
  const mediaByProduct = await fetchMediaFor(rows.map((r) => r.id))
  return rows.map((row) => rowToProduct(row, mediaByProduct.get(row.id)))
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  const row = data as ProductRow
  const mediaByProduct = await fetchMediaFor([row.id])
  return rowToProduct(row, mediaByProduct.get(row.id))
}

// Lookup by slug — used by /producto/[slug]. Falls back to id lookup
// for the transition period while some rows may not have slugs yet.
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!error && data) {
    const row = data as ProductRow
    const mediaByProduct = await fetchMediaFor([row.id])
    return rowToProduct(row, mediaByProduct.get(row.id))
  }

  // Fallback: slug column may still be null for some rows — try by id
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
  if (isUuid) return getProductById(slug)
  return null
}

// Products in the same category (excluding the current one). Used by
// the "Quizás también te interese" block on the detail page.
export async function getRelatedProducts(
  category: string,
  excludeId: string,
  limit: number = 4
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .neq('id', excludeId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  const rows = data as ProductRow[]
  const mediaByProduct = await fetchMediaFor(rows.map((r) => r.id))
  return rows.map((r) => rowToProduct(r, mediaByProduct.get(r.id)))
}

// Reviews for a product, newest first.
export async function getReviewsForProduct(productId: string): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return (data as ProductReviewRow[]).map(rowToProductReview)
}

// Aggregate average rating + count. Returns null if no reviews.
export function summarizeReviews(reviews: ProductReview[]): { average: number; count: number } | null {
  if (reviews.length === 0) return null
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  }
}

// ─── Admin writes (uses service role, bypasses RLS) ─────────────

export async function createProduct(
  product: Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>
): Promise<Product | null> {
  const client = createServerClient()
  const { data, error } = await client
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating product:', error)
    return null
  }

  return rowToProduct(data as ProductRow)
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<ProductRow, 'id' | 'created_at'>>
): Promise<Product | null> {
  const client = createServerClient()
  const { data, error } = await client
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    console.error('Error updating product:', error)
    return null
  }

  return rowToProduct(data as ProductRow)
}

export async function deleteProduct(id: string): Promise<boolean> {
  const client = createServerClient()
  const { error } = await client.from('products').delete().eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return false
  }

  return true
}

// ─── Image upload ────────────────────────────────────────────────

export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string | null> {
  const client = createServerClient()
  const ext = file.name.split('.').pop()
  const path = `${productId}.${ext}`

  const { error } = await client.storage
    .from('product-images')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) {
    console.error('Error uploading image:', error)
    return null
  }

  const { data } = client.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export { PRODUCTS_REVALIDATE_SECONDS }
