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

export async function getFeaturedProduct(): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('badge', '%vendido%')
    .gt('stock', 0)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!error && data) {
    const row = data as ProductRow
    const mediaByProduct = await fetchMediaFor([row.id])
    return rowToProduct(row, mediaByProduct.get(row.id))
  }

  const fallback = await supabase
    .from('products')
    .select('*')
    .gt('stock', 0)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fallback.error || !fallback.data) return null
  const row = fallback.data as ProductRow
  const mediaByProduct = await fetchMediaFor([row.id])
  return rowToProduct(row, mediaByProduct.get(row.id))
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

export type ProductWriteResult =
  | { ok: true; product: Product }
  | { ok: false; error: string; code?: string; hint?: string }

// Turn a Supabase/Postgres error into a short, actionable Spanish message.
// Recognises the most common failures we've hit: missing tables, RLS blocks,
// missing/renamed columns (type vs media_type), NOT NULL violations and
// unique-index collisions.
function formatDbError(err: { message?: string; code?: string; details?: string; hint?: string } | null): {
  error: string
  code?: string
  hint?: string
} {
  if (!err) return { error: 'Error desconocido de la base de datos.' }
  const raw = err.message ?? 'Error desconocido de la base de datos.'
  const lower = raw.toLowerCase()
  let hint: string | undefined = err.hint

  if (lower.includes('row-level security') || lower.includes('rls') || lower.includes('policy')) {
    hint = 'Falta policy de INSERT/UPDATE en la tabla, o SUPABASE_SERVICE_ROLE_KEY no está configurada.'
  } else if (lower.includes('schema cache') || err.code === 'PGRST204') {
    hint = 'Falta una migración en Supabase. Corre 004_extended_fields.sql y 006_product_media_standardize.sql en el SQL Editor.'
  } else if (lower.includes('does not exist') && lower.includes('column')) {
    hint = 'Una columna del payload no existe en la tabla. Corre las migraciones 004 y 006 en el SQL Editor de Supabase.'
  } else if (lower.includes('does not exist') && lower.includes('relation')) {
    hint = 'Una tabla no existe en Supabase. Ejecuta las migraciones SQL pendientes.'
  } else if (lower.includes('violates not-null') || lower.includes('null value')) {
    hint = 'Falta un campo obligatorio. Revisa name, short_name, category, price o stock.'
  } else if (lower.includes('duplicate key') || lower.includes('unique constraint')) {
    hint = 'Ya existe otro registro con ese valor único (slug o primary por producto).'
  } else if (lower.includes('invalid input syntax')) {
    hint = 'El formato de un campo es inválido. Revisa precio y stock (deben ser números).'
  }

  return { error: raw, code: err.code, hint }
}

// Strip keys whose values are null/undefined. Prevents Supabase from
// complaining about "column not found in schema cache" for fields that
// were added by migrations that haven't been run yet (e.g., long_description
// or specs before 004_extended_fields.sql). If we never mention the column
// in the payload, Supabase won't validate it.
function stripNullish<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && v !== undefined) out[k] = v
  }
  return out as Partial<T>
}

// Detect Supabase's PGRST204 "column not found in schema cache" error and
// extract the missing column name. Returns null if the error is unrelated.
function extractMissingColumn(err: { code?: string; message?: string } | null): string | null {
  if (!err) return null
  const code = err.code ?? ''
  const msg = err.message ?? ''
  // PGRST204 is the PostgREST code for "column not found". The message
  // usually looks like: "Could not find the 'xxx' column of 'yyy' in the
  // schema cache".
  if (code !== 'PGRST204' && !msg.includes('schema cache')) return null
  const match = msg.match(/'([^']+)'\s+column/i)
  return match?.[1] ?? null
}

export async function createProduct(
  product: Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>
): Promise<ProductWriteResult> {
  const client = createServerClient()
  // 1st attempt: strip nullish keys so missing columns aren't even mentioned.
  let payload: Record<string, unknown> = stripNullish(product as unknown as Record<string, unknown>)

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await client
      .from('products')
      .insert(payload)
      .select()
      .single()

    if (!error && data) {
      return { ok: true, product: rowToProduct(data as ProductRow) }
    }

    console.error(`[createProduct] attempt=${attempt} Supabase error:`, {
      payloadKeys: Object.keys(payload),
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    })

    // If the error is a schema cache miss, drop that column and retry.
    // This makes the admin work even when a migration hasn't been run yet.
    const missing = extractMissingColumn(error)
    if (missing && missing in payload) {
      console.warn(
        `[createProduct] Dropping '${missing}' — column not in Supabase schema cache. ` +
          'Corre la migración correspondiente (ej. 004_extended_fields.sql) para habilitarla.',
      )
      delete payload[missing]
      continue
    }

    // Non-recoverable — surface the real error to the UI.
    return { ok: false, ...formatDbError(error) }
  }

  return { ok: false, error: 'Demasiados reintentos al insertar el producto.' }
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<ProductRow, 'id' | 'created_at'>>
): Promise<ProductWriteResult> {
  const client = createServerClient()
  let payload: Record<string, unknown> = stripNullish(updates as unknown as Record<string, unknown>)

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await client
      .from('products')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      return { ok: true, product: rowToProduct(data as ProductRow) }
    }

    console.error(`[updateProduct] attempt=${attempt} Supabase error:`, {
      id,
      payloadKeys: Object.keys(payload),
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    })

    const missing = extractMissingColumn(error)
    if (missing && missing in payload) {
      console.warn(
        `[updateProduct] Dropping '${missing}' — column not in Supabase schema cache.`,
      )
      delete payload[missing]
      continue
    }

    return { ok: false, ...formatDbError(error) }
  }

  return { ok: false, error: 'Demasiados reintentos al actualizar el producto.' }
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
