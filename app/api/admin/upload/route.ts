import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { auth } from '@/auth'

// Force Node.js runtime + extend timeout. WITHOUT this the route can fall to
// edge runtime (stricter body size), which is the #1 cause of 413 errors on
// Vercel when uploading multi-MB images.
export const runtime = 'nodejs'
export const maxDuration = 60

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch (e) {
    console.error('[/api/admin/upload] FormData parse error:', e)
    return NextResponse.json(
      {
        error: 'No se pudo leer el archivo.',
        hint:
          'Si la imagen es mayor a ~4.5MB y estás en Vercel Hobby, el archivo se corta antes de llegar al servidor. Usa una imagen más liviana (≤4MB) o sube a plan Pro.',
      },
      { status: 413 },
    )
  }

  const file = formData.get('file') as File | null
  const uploadPath = formData.get('path') as string | null

  if (!file || !uploadPath) {
    return NextResponse.json({ error: 'Faltan campos: file y path' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Solo se permiten JPG, PNG o WebP' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `El archivo supera los ${MAX_BYTES / 1024 / 1024}MB permitidos.` },
      { status: 413 },
    )
  }

  const client = createServerClient()
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error } = await client.storage
    .from('product-images')
    .upload(uploadPath, buffer, { upsert: true, contentType: file.type })

  if (error) {
    console.error('[/api/admin/upload] Supabase error:', error)
    return NextResponse.json(
      { error: error.message ?? 'Error al subir la imagen a Supabase' },
      { status: 500 },
    )
  }

  const { data } = client.storage.from('product-images').getPublicUrl(uploadPath)
  return NextResponse.json({ url: data.publicUrl })
}
