import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  uploadMediaFile,
  validateMediaFile,
  detectMediaType,
} from '@/lib/media'

// POST /api/admin/media/upload
//
// Expects multipart/form-data with:
//   - file: image or video
//   - productId: UUID of the owning product
//
// Returns: { url, mediaType } on success; { error } on failure.
// This route ONLY uploads the file to storage; it does NOT insert a row
// into product_media. That happens separately via POST /api/admin/media
// so that MediaList can stage uploads locally and commit on save.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'FormData inválido' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const productId = formData.get('productId') as string | null

  if (!file || !productId) {
    return NextResponse.json(
      { error: 'Faltan campos: file y productId' },
      { status: 400 },
    )
  }

  const err = validateMediaFile(file)
  if (err) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const kind = detectMediaType(file.type)!
  const url = await uploadMediaFile(file, productId, kind)
  if (!url) {
    return NextResponse.json(
      { error: 'Error al subir el archivo a Supabase' },
      { status: 500 },
    )
  }

  return NextResponse.json({ url, mediaType: kind })
}
