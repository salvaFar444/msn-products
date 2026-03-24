'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatCOP } from '@/lib/formatCurrency'
import StockBadge from './StockBadge'
import type { Product } from '@/types'

interface ProductTableProps {
  products: Product[]
  onDelete: (id: string) => Promise<void>
}

export default function ProductTable({ products, onDelete }: ProductTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const confirmDelete = (id: string) => setDeleteId(id)
  const cancelDelete = () => setDeleteId(null)

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      await onDelete(deleteId)
      setDeleteId(null)
    })
  }

  return (
    <div className="relative overflow-x-auto rounded-xl border border-border">
      {/* Confirm modal */}
      {deleteId && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
          <div className="card p-6 max-w-sm mx-4 animate-scale-in space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/15">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-danger" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">¿Eliminar producto?</h3>
              <p className="mt-1 text-sm text-muted">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={cancelDelete} className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-white hover:bg-white/5 transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={isPending} className="flex-1 rounded-xl bg-danger/80 hover:bg-danger py-2 text-sm font-medium text-white transition-colors disabled:opacity-50">
                {isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-raised">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Producto</th>
            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Categoría</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted">Precio</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted">Stock</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-muted">
                No hay productos. <Link href="/admin/products/new" className="text-accent hover:underline">Agregar el primero</Link>
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="hover:bg-white/2 transition-colors">
                {/* Product */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-surface-raised">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white leading-snug">{product.name}</p>
                      {product.badge && (
                        <span className="text-xs text-accent">{product.badge}</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="hidden md:table-cell px-4 py-4 text-muted">
                  {product.category}
                </td>

                {/* Price */}
                <td className="px-4 py-4 text-right font-semibold text-white">
                  {formatCOP(product.price)}
                </td>

                {/* Stock */}
                <td className="px-4 py-4 text-center">
                  <StockBadge stock={product.stock} />
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-lg border border-border p-2 text-muted hover:border-border-strong hover:text-white transition-colors"
                      aria-label={`Editar ${product.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => confirmDelete(product.id)}
                      className="rounded-lg border border-border p-2 text-muted hover:border-danger/40 hover:text-danger transition-colors"
                      aria-label={`Eliminar ${product.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
