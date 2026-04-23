'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Check, ShoppingCart, Truck, Video } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatCOP } from '@/lib/formatCurrency'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

function getBadgeStyle(badge: string): string {
  const b = badge.toLowerCase()
  if (b.includes('nuevo'))
    return 'bg-success/10 text-success border-success/30'
  if (b.includes('vendido'))
    return 'bg-[color:var(--text-primary)] text-white border-[color:var(--text-primary)]'
  if (b.includes('últim') || b.includes('ultim'))
    return 'bg-danger/10 text-danger border-danger/30'
  return 'bg-[color:var(--text-primary)] text-white border-[color:var(--text-primary)]'
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const inStock = product.stock > 0

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock || added) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const href = `/producto/${product.slug}`

  return (
    <Link
      href={href}
      aria-label={`Ver ${product.name}`}
      className="group block h-full rounded-3xl transition-transform duration-150 ease-out active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--text-primary)] focus-visible:ring-offset-2"
    >
      <article
        className="flex h-full flex-col overflow-hidden rounded-3xl bg-[color:var(--bg-surface-elevated)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] group-hover:-translate-y-1.5"
        style={{
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div
          className="relative aspect-square overflow-hidden"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-7 transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.06]"
          />

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.badge && (
              <span
                className={`inline-block rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${getBadgeStyle(product.badge)}`}
              >
                {product.badge}
              </span>
            )}
            {!inStock && (
              <span className="inline-block rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-danger">
                Agotado
              </span>
            )}
            {inStock && product.stock > 0 && product.stock <= 3 && (
              <span className="inline-block rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-warning">
                Últimas {product.stock}
              </span>
            )}
          </div>

          {product.hasVideo && (
            <span
              className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm"
              aria-label="Este producto tiene video"
            >
              <Video className="h-3 w-3" aria-hidden="true" strokeWidth={2.5} />
              Video
            </span>
          )}

          <div className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
            <div
              className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg"
              style={{ backgroundColor: '#16A34A' }}
            >
              <Truck className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
              Domicilio gratis en Montería
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
            {product.category}
          </p>

          <h3 className="font-display mb-2 text-lg font-extrabold leading-snug text-[color:var(--text-strong)]">
            {product.name}
          </h3>

          <p className="mb-4 flex-1 line-clamp-2 text-sm leading-relaxed text-[color:var(--text-body)]">
            {product.description}
          </p>

          {product.features.length > 0 && (
            <ul className="mb-4 space-y-1">
              {product.features.slice(0, 2).map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-xs text-[color:var(--text-body)]"
                >
                  <Check
                    className="h-3.5 w-3.5 flex-shrink-0 text-[color:var(--text-primary)]"
                    aria-hidden="true"
                    strokeWidth={3}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          <div
            className="mt-auto flex items-end justify-between gap-3 pt-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div>
              <p className="font-display text-2xl font-extrabold leading-none text-[color:var(--text-strong)]">
                {formatCOP(product.price)}
              </p>
              {inStock && product.stock > 0 && product.stock <= 5 && (
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-danger">
                  ¡Últimas unidades!
                </span>
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={!inStock}
              aria-label={
                !inStock
                  ? `${product.name} — Agotado`
                  : `Agregar ${product.name} al carrito`
              }
              className={`flex h-11 flex-shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-bold uppercase tracking-wide transition-all duration-200 active:scale-[0.96] ${
                !inStock
                  ? 'cursor-not-allowed bg-[color:var(--bg-surface)] text-[color:var(--text-faint)]'
                  : added
                    ? 'border border-success/40 bg-success/10 text-success'
                    : 'bg-[color:var(--text-primary)] text-white hover:bg-black hover:shadow-lg'
              }`}
            >
              {!inStock ? (
                'Agotado'
              ) : added ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" strokeWidth={3} />
                  Agregado
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  Añadir
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    </Link>
  )
}
