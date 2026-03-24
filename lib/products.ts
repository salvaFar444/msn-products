import { supabase } from './supabase'
import { createServerClient } from './supabase-server'
import { type Product, type ProductRow, rowToProduct } from '@/types'
import { PRODUCTS_REVALIDATE_SECONDS } from './constants'

// ─── Public reads (uses anon client, cached by Next.js ISR) ──────

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return (data as ProductRow[]).map(rowToProduct)
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return rowToProduct(data as ProductRow)
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
