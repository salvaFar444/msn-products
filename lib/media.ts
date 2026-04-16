import { createServerClient } from './supabase-server'
import { supabase } from './supabase'
import {
  type ProductMedia,
  type ProductMediaRow,
  type MediaType,
  rowToProductMedia,
} from '@/types'
import {
  SUPABASE_BUCKET,
  SUPABASE_VIDEO_BUCKET,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
  MAX_MEDIA_PER_PRODUCT,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from './constants'

// ─── Validation helpers ──────────────────────────────────────────

export interface MediaValidationError {
  code: 'TYPE' | 'SIZE' | 'COUNT'
  message: string
}

export function detectMediaType(mime: string): MediaType | null {
  if (ALLOWED_IMAGE_TYPES.includes(mime)) return 'image'
  if (ALLOWED_VIDEO_TYPES.includes(mime)) return 'video'
  return null
}

export function validateMediaFile(
  file: Pick<File, 'type' | 'size'>
): MediaValidationError | null {
  const kind = detectMediaType(file.type)
  if (!kind) {
    return {
      code: 'TYPE',
      message: 'Tipo no soportado. Usa JPG/PNG/WebP para imágenes o MP4/WebM para video.',
    }
  }
  const max = kind === 'image' ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB
  if (file.size > max * 1024 * 1024) {
    return {
      code: 'SIZE',
      message:
        kind === 'image'
          ? `La imagen no puede superar ${MAX_IMAGE_SIZE_MB}MB.`
          : `El video no puede superar ${MAX_VIDEO_SIZE_MB}MB.`,
    }
  }
  return null
}

export function validateMediaCount(current: number): MediaValidationError | null {
  if (current >= MAX_MEDIA_PER_PRODUCT) {
    return {
      code: 'COUNT',
      message: `Máximo ${MAX_MEDIA_PER_PRODUCT} archivos por producto.`,
    }
  }
  return null
}

// ─── Public read ─────────────────────────────────────────────────

export async function getMediaForProduct(productId: string): Promise<ProductMedia[]> {
  const { data, error } = await supabase
    .from('product_media')
    .select('*')
    .eq('product_id', productId)
    .order('position', { ascending: true })

  if (error || !data) return []
  return (data as ProductMediaRow[]).map(rowToProductMedia)
}

// ─── Admin writes (service role) ────────────────────────────────

// Upload a single file to the correct bucket and return its public URL.
// Filename is a random UUID per upload to avoid collisions.
export async function uploadMediaFile(
  file: File,
  productId: string,
  kind: MediaType
): Promise<string | null> {
  const client = createServerClient()
  const bucket = kind === 'image' ? SUPABASE_BUCKET : SUPABASE_VIDEO_BUCKET
  const ext = (file.name.split('.').pop() ?? (kind === 'image' ? 'jpg' : 'mp4')).toLowerCase()
  const path = `${productId}/${crypto.randomUUID()}.${ext}`

  const { error } = await client.storage
    .from(bucket)
    .upload(path, file, { upsert: false, contentType: file.type })

  if (error) {
    console.error('[media] upload error:', error)
    return null
  }

  const { data } = client.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export interface CreateMediaInput {
  productId: string
  url: string
  mediaType: MediaType
  position: number
  isPrimary?: boolean
}

export async function createMediaRow(input: CreateMediaInput): Promise<ProductMedia | null> {
  const client = createServerClient()

  // If marking this as primary, clear any other primary image for this product
  // first (the unique partial index would reject otherwise).
  if (input.isPrimary && input.mediaType === 'image') {
    await client
      .from('product_media')
      .update({ is_primary: false })
      .eq('product_id', input.productId)
      .eq('is_primary', true)
  }

  const { data, error } = await client
    .from('product_media')
    .insert({
      product_id: input.productId,
      url: input.url,
      media_type: input.mediaType,
      position: input.position,
      is_primary: input.isPrimary ?? false,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('[media] create row error:', error)
    return null
  }
  return rowToProductMedia(data as ProductMediaRow)
}

// Reorder — single DB round-trip: sends the new position list.
// Callers should pre-validate that positions are 0..n-1 contiguous.
export async function reorderMedia(
  productId: string,
  order: { id: string; position: number }[]
): Promise<boolean> {
  const client = createServerClient()
  const updates = await Promise.all(
    order.map((o) =>
      client
        .from('product_media')
        .update({ position: o.position })
        .eq('id', o.id)
        .eq('product_id', productId),
    ),
  )
  return updates.every((r) => !r.error)
}

// Set a specific media row as primary (images only). Clears other primaries first.
export async function setPrimaryMedia(
  productId: string,
  mediaId: string
): Promise<boolean> {
  const client = createServerClient()

  // Verify the media belongs to the product and is an image.
  const { data: row, error: fetchErr } = await client
    .from('product_media')
    .select('id, media_type, product_id')
    .eq('id', mediaId)
    .single()

  if (fetchErr || !row || row.product_id !== productId || row.media_type !== 'image') {
    return false
  }

  // Clear existing primaries for this product.
  const { error: clearErr } = await client
    .from('product_media')
    .update({ is_primary: false })
    .eq('product_id', productId)
    .eq('is_primary', true)
  if (clearErr) return false

  const { error: setErr } = await client
    .from('product_media')
    .update({ is_primary: true })
    .eq('id', mediaId)
  return !setErr
}

// Delete a media row AND its file from storage. Best-effort on storage.
export async function deleteMedia(mediaId: string): Promise<boolean> {
  const client = createServerClient()

  const { data: row, error: fetchErr } = await client
    .from('product_media')
    .select('*')
    .eq('id', mediaId)
    .single()

  if (fetchErr || !row) return false

  const typed = row as ProductMediaRow

  // Try to extract the storage path from the public URL. Supabase public URLs
  // look like: https://<proj>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const bucket = typed.media_type === 'image' ? SUPABASE_BUCKET : SUPABASE_VIDEO_BUCKET
  const marker = `/object/public/${bucket}/`
  const idx = typed.url.indexOf(marker)
  if (idx >= 0) {
    const path = typed.url.slice(idx + marker.length)
    await client.storage.from(bucket).remove([path]) // ignore errors
  }

  const { error: delErr } = await client
    .from('product_media')
    .delete()
    .eq('id', mediaId)
  return !delErr
}

// Sync the `products.image_url` cache to match the current primary image
// (or the first image if no primary is set). Call after any media change.
export async function syncProductImageCache(productId: string): Promise<void> {
  const client = createServerClient()

  const { data, error } = await client
    .from('product_media')
    .select('url, is_primary, position, media_type')
    .eq('product_id', productId)
    .eq('media_type', 'image')
    .order('is_primary', { ascending: false })
    .order('position', { ascending: true })
    .limit(1)

  if (error || !data || data.length === 0) return

  await client
    .from('products')
    .update({ image_url: data[0].url, updated_at: new Date().toISOString() })
    .eq('id', productId)
}
