import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductForm from '@/components/admin/ProductForm'
import { getProductById, updateProduct } from '@/lib/products'
import type { ProductFormData } from '@/types'
import { revalidatePath } from 'next/cache'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: 'Editar producto — Admin' }
}

export default async function EditProductPage({ params }: Props) {
  const product = await getProductById(params.id)
  if (!product) notFound()

  async function handleUpdate(data: ProductFormData): Promise<{ success: boolean; error?: string }> {
    'use server'

    // imageFile is always undefined here — upload happens client-side via /api/admin/upload
    const imageUrl = data.imageUrl ?? '/img.jpg'

    const updated = await updateProduct(params.id, {
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

    if (!updated) return { success: false, error: 'No se pudo actualizar el producto.' }

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
