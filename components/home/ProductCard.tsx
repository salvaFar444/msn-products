'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { formatCOP } from '@/lib/formatCurrency'
import Badge from '@/components/ui/Badge'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const inStock = product.stock > 0

  const handleAdd = () => {
    if (!inStock || added) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="card card-hover group flex flex-col overflow-hidden rounded-2xl">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-raised rounded-t-2xl">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-6 transition-all duration-300 ease-out group-hover:scale-105 group-hover:brightness-[1.03]"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <Badge variant="accent">{product.badge}</Badge>
          )}
          {!inStock && (
            <Badge variant="danger">Agotado</Badge>
          )}
          {inStock && product.stock <= 3 && (
            <Badge variant="warning">Últimas {product.stock} unidades</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category */}
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-low">
          {product.category}
        </p>

        {/* Name */}
        <h3 className="mb-3 text-base font-semibold leading-snug text-primary">
          {product.name}
        </h3>

        {/* Description */}
        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted line-clamp-2">
          {product.description}
        </p>

        {/* Features */}
        {product.features.length > 0 && (
          <ul className="mb-4 space-y-1">
            {product.features.slice(0, 3).map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-xs text-muted"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3 w-3 text-accent flex-shrink-0"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                    clipRule="evenodd"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-border">
          <p className="text-xl font-bold text-primary">{formatCOP(product.price)}</p>

          <button
            onClick={handleAdd}
            disabled={!inStock}
            aria-label={
              !inStock
                ? `${product.name} — Agotado`
                : `Agregar ${product.name} al carrito`
            }
            className={`flex h-10 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
              !inStock
                ? 'cursor-not-allowed bg-white/5 text-muted'
                : added
                ? 'bg-success/20 text-success border border-success/30'
                : 'bg-accent hover:bg-accent-hover text-white shadow-md shadow-accent/20'
            }`}
          >
            {!inStock ? (
              'Agotado'
            ) : added ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                    clipRule="evenodd"
                  />
                </svg>
                ¡Agregado!
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
