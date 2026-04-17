import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import ProductForm from '@/components/admin/ProductForm'
import { getProductById, updateProduct } from '@/lib/products'
import { ensureLegacyMediaBackfilled } from '@/lib/media'
import { parseProductForm } from '@/lib/validation/productSchema'
import type { ProductFormData } from '@/types'
import { revalidatePath } from 'next/cache'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: 'Editar producto — Admin' }
}

export default async function EditProductPage({ params }: Props) {
  // First fetch — may return a product with no media[] if it was created
  // before the product_media table existed (only has legacy image_url).
  let product = await getProductById(params.id)
  if (!product) notFound()

  // If no media rows exist yet but there's a legacy image_url, insert a
  // single primary image row so MediaList shows the existing image. This
  // is idempotent: no-op if any media row is already present.
  if ((!product.media || product.media.length === 0) && product.image) {
    const inserted = await ensureLegacyMediaBackfilled(product.id, product.image)
    if (inserted) {
      // Re-fetch so the new media row is visible to MediaList
      product = await getProductById(params.id)
      if (!product) notFound()
    }
  }

  async function handleUpdate(data: ProductFormData): Promise<{ success: boolean; error?: string }> {
    'use server'

    const session = await auth()
    if (!session) {
      console.error('[UPDATE] No session — refusing update')
      return { success: false, error: 'Sesión expirada. Vuelve a iniciar sesión.' }
    }

    console.log('[UPDATE] step=start', {
      id: params.id,
      name: data.name,
      price: data.price,
      stock: data.stock,
    })

    const parsed = parseProductForm(data)
    if (!parsed.ok) {
      console.warn('[UPDATE] step=validate failed:', parsed)
      return {
        success: false,
        error: parsed.field ? `${parsed.field}: ${parsed.error}` : parsed.error,
      }
    }
    const v = parsed.data

    // imageFile is always undefined here — upload happens client-side via /api/admin/upload
    const imageUrl = data.imageUrl ?? '/img.jpg'

    const result = await updateProduct(params.id, {
      name: v.name,
      short_name: v.shortName,
      category: v.category,
      price: v.price,
      description: v.description || null,
      long_description: v.longDescription || null,
      specs: v.specs && Object.keys(v.specs).length > 0 ? v.specs : null,
      image_url: imageUrl,
      badge: v.badge || null,
      stock: v.stock,
      features: v.features,
    })

    if (!result.ok) {
      console.error('[UPDATE] step=update FAILED:', result)
      return {
        success: false,
        error: result.hint ? `${result.error} — ${result.hint}` : result.error,
      }
    }

    console.log('[UPDATE] step=success', { id: result.product.id })

    revalidatePath('/')
    revalidatePath('/admin/products')
    return { success: true }
  }

  return (
    <div className="p-6 lg:p-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/admin/products" className="hover:text-white transition-colors">Productos</Link>
        <span aria-hidden="true">/</span>
        <span className="text-white">Editar</span>
      </nav>
      <h1 className="mb-2 text-2xl font-bold text-white">Editar producto</h1>
      <p className="mb-8 text-sm text-muted">{product.name}</p>
      <ProductForm product={product} onSubmit={handleUpdate} />
    </div>
  )
}
