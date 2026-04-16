import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  createMediaRow,
  reorderMedia,
  setPrimaryMedia,
  deleteMedia,
  syncProductImageCache,
  validateMediaCount,
} from '@/lib/media'
import { supabase } from '@/lib/supabase'
import type { MediaType, ProductMediaRow } from '@/types'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await auth()
  return !!session
}

// POST /api/admin/media
//
// Body: { productId, url, mediaType, position, isPrimary? }
// Creates a product_media row for a file already uploaded via
// /api/admin/media/upload. Enforces the MAX_MEDIA_PER_PRODUCT cap.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.productId || !body?.url || !body?.mediaType) {
    return NextResponse.json(
      { error: 'Faltan campos: productId, url, mediaType' },
      { status: 400 },
    )
  }

  // Count current media to enforce the per-product cap.
  const { data: existing } = await supabase
    .from('product_media')
    .select('id')
    .eq('product_id', body.productId)

  const countErr = validateMediaCount((existing as ProductMediaRow[] | null)?.length ?? 0)
  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 400 })
  }

  const row = await createMediaRow({
    productId: body.productId as string,
    url: body.url as string,
    mediaType: body.mediaType as MediaType,
    position: (body.position as number | undefined) ?? (existing?.length ?? 0),
    isPrimary: Boolean(body.isPrimary),
  })

  if (!row) {
    return NextResponse.json({ error: 'No se pudo crear el registro' }, { status: 500 })
  }

  await syncProductImageCache(body.productId as string)
  revalidatePath('/')
  revalidatePath('/admin/products')
  return NextResponse.json({ media: row })
}

// PATCH /api/admin/media
//
// Two actions, switched by `action` field in body:
//   - { action: 'reorder', productId, order: [{id, position}, ...] }
//   - { action: 'setPrimary', productId, mediaId }
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.action || !body?.productId) {
    return NextResponse.json(
      { error: 'Faltan campos: action y productId' },
      { status: 400 },
    )
  }

  if (body.action === 'reorder') {
    if (!Array.isArray(body.order)) {
      return NextResponse.json({ error: 'order debe ser un array' }, { status: 400 })
    }
    const ok = await reorderMedia(body.productId as string, body.order)
    if (!ok) return NextResponse.json({ error: 'Error al reordenar' }, { status: 500 })
    await syncProductImageCache(body.productId as string)
    revalidatePath('/')
    revalidatePath('/admin/products')
    return NextResponse.json({ success: true })
  }

  if (body.action === 'setPrimary') {
    if (!body.mediaId) {
      return NextResponse.json({ error: 'Falta mediaId' }, { status: 400 })
    }
    const ok = await setPrimaryMedia(body.productId as string, body.mediaId as string)
    if (!ok) return NextResponse.json({ error: 'Error al marcar como primaria' }, { status: 500 })
    await syncProductImageCache(body.productId as string)
    revalidatePath('/')
    revalidatePath('/admin/products')
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Acción desconocida' }, { status: 400 })
}

// DELETE /api/admin/media?id=<mediaId>&productId=<productId>
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const mediaId = searchParams.get('id')
  const productId = searchParams.get('productId')

  if (!mediaId || !productId) {
    return NextResponse.json({ error: 'Faltan parámetros id y productId' }, { status: 400 })
  }

  const ok = await deleteMedia(mediaId)
  if (!ok) return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })

  await syncProductImageCache(productId)
  revalidatePath('/')
  revalidatePath('/admin/products')
  return NextResponse.json({ success: true })
}
