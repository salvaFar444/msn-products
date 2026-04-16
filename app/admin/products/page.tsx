import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllProducts, deleteProduct } from '@/lib/products'
import ProductTable from '@/components/admin/ProductTable'
import { revalidatePath } from 'next/cache'

export const metadata: Metadata = { title: 'Productos — Admin' }
export const dynamic = 'force-dynamic'

async function handleDelete(id: string) {
  'use server'
  await deleteProduct(id)
  revalidatePath('/')
  revalidatePath('/admin/products')
}

export default async function AdminProductsPage() {
  const products = await getAllProducts()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {products.length} producto{products.length !== 1 ? 's' : ''} en el catálogo
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C96700]"
          style={{
            backgroundColor: '#E87A00',
            boxShadow: '0 10px 28px rgba(232,122,0,0.28)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo producto
        </Link>
      </div>

      <ProductTable products={products} onDelete={handleDelete} />
    </div>
  )
}
