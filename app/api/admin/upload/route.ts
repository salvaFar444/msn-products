import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { auth } from '@/auth'

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
  } catch {
    return NextResponse.json({ error: 'FormData inválido' }, { status: 400 })
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
    return NextResponse.json({ error: 'El archivo supera los 5 MB' }, { status: 400 })
  }

  const client = createServerClient()
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error } = await client.storage
    .from('product-images')
    .upload(uploadPath, buffer, { upsert: true, contentType: file.type })

  if (error) {
    console.error('[/api/admin/upload] Supabase error:', error)
    return NextResponse.json({ error: 'Error al subir la imagen a Supabase' }, { status: 500 })
  }

  const { data } = client.storage.from('product-images').getPublicUrl(uploadPath)
  return NextResponse.json({ url: data.publicUrl })
}
