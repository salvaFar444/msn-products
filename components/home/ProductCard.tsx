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

// Maps common Spanish badge strings to a visual variant
function getBadgeStyle(badge: string): string {
  const b = badge.toLowerCase()
  if (b.includes('nuevo'))
    return 'bg-success/10 text-success border-success/30'
  if (b.includes('vendido'))
    return 'bg-accent text-white border-accent'
  if (b.includes('últim') || b.includes('ultim'))
    return 'bg-danger/10 text-danger border-danger/30'
  return 'bg-primary text-white border-primary'
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const inStock = product.stock > 0

  // The CTA button is nested inside a <Link> wrapping the whole card. When
  // the user clicks "Agregar al carrito" we must stop the navigation so they
  // stay on the home grid with the cart-drawer behavior intact.
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
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
    >
      <article className="card card-hover flex h-full flex-col overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-surface">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />

          {/* Badges */}
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

          {/* Video indicator (top-right) */}
          {product.hasVideo && (
            <span
              className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm"
              aria-label="Este producto tiene video"
            >
              <Video className="h-3 w-3" aria-hidden="true" strokeWidth={2.5} />
              Video
            </span>
          )}

          {/* Free delivery overlay on hover */}
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

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Category label */}
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-accent">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="mb-2 text-base font-extrabold leading-snug text-ink-strong">
            {product.name}
          </h3>

          {/* Description */}
          <p className="mb-3 flex-1 line-clamp-2 text-sm leading-relaxed text-ink-light">
            {product.description}
          </p>

          {/* Features */}
          {product.features.length > 0 && (
            <ul className="mb-4 space-y-1">
              {product.features.slice(0, 2).map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-xs text-ink-light"
                >
                  <Check
                    className="h-3.5 w-3.5 flex-shrink-0 text-accent"
                    aria-hidden="true"
                    strokeWidth={3}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          {/* Price + CTA */}
          <div className="mt-auto border-t border-border pt-4">
            <div className="mb-3 flex items-baseline gap-2">
              <p className="text-2xl font-extrabold text-ink-strong">
                {formatCOP(product.price)}
              </p>
              {inStock && product.stock > 0 && product.stock <= 5 && (
                <span className="text-xs font-bold text-danger">
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
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold tracking-wide uppercase transition-all duration-200 active:scale-[0.97] ${
                !inStock
                  ? 'cursor-not-allowed bg-surface text-ink-muted'
                  : added
                    ? 'bg-success/10 text-success border border-success/40'
                    : 'bg-primary text-white hover:opacity-90'
              }`}
            >
              {!inStock ? (
                'Agotado'
              ) : added ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" strokeWidth={3} />
                  ¡Agregado!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  Agregar al carrito
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    </Link>
  )
}
