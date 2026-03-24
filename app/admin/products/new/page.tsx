import type { Metadata } from 'next'
import Link from 'next/link'
import ProductForm from '@/components/admin/ProductForm'
import { createProduct } from '@/lib/products'
import type { ProductFormData } from '@/types'
import { revalidatePath } from 'next/cache'

export const metadata: Metadata = { title: 'Nuevo producto — Admin' }

async function handleCreate(data: ProductFormData): Promise<{ success: boolean; error?: string }> {
  'use server'

  // imageFile is always undefined here — upload happens client-side via /api/admin/upload
  const imageUrl = data.imageUrl ?? '/img.jpg'

  const product = await createProduct({
    name: data.name,
    short_name: data.shortName,
    category: data.category,
    price: data.price,
    description: data.description || null,
    image_url: imageUrl,
    badge: data.badge || null,
    stock: data.stock,
    features: data.features,
  })

  if (!product) return { success: false, error: 'No se pudo crear el producto.' }

  revalidatePath('/')
  revalidatePath('/admin/products')
  return { success: true }
}

export default function NewProductPage() {
  return (
    <div className="p-6 lg:p-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/admin/products" className="hover:text-white transition-colors">Productos</Link>
        <span aria-hidden="true">/</span>
        <span className="text-white">Nuevo</span>
      </nav>
      <h1 className="mb-8 text-2xl font-bold text-white">Crear producto</h1>
      <ProductForm onSubmit={handleCreate} />
    </div>
  )
}
