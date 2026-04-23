import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  uploadMediaFile,
  validateMediaFile,
  detectMediaType,
} from '@/lib/media'

// Route config — run in Node.js so we can buffer multipart body for videos.
// Next.js App Router route handlers in Node don't impose the 1MB limit that
// server actions do; the ceiling becomes whatever the platform allows
// (Vercel serverless: ~4.5MB; Vercel Pro+: higher; self-hosted: unlimited).
export const runtime = 'nodejs'
export const maxDuration = 60

// POST /api/admin/media/upload
//
// Expects multipart/form-data with:
//   - file: image or video
//   - productId: UUID of the owning product
//
// Returns: { url, mediaType } on success; { error, hint? } on failure.
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
  } catch (e) {
    console.error('[/api/admin/media/upload] FormData parse error:', e)
    return NextResponse.json(
      {
        error: 'No se pudo leer el archivo.',
        hint: 'Si es un video mayor a ~4.5MB y estás en Vercel (plan Hobby), el archivo se corta antes de llegar al servidor. Prueba con un video más liviano o sube a Pro.',
      },
      { status: 400 },
    )
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
  const result = await uploadMediaFile(file, productId, kind)
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, hint: result.hint },
      { status: 500 },
    )
  }

  return NextResponse.json({ url: result.url, mediaType: kind })
}
