'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { formatCOP } from '@/lib/formatCurrency'
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
    <article
      className="card card-hover group flex flex-col overflow-hidden"
      style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{ backgroundColor: '#1A1A1A' }}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-7 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
            >
              {product.badge}
            </span>
          )}
          {!inStock && (
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: 'rgba(255,59,48,0.12)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.2)' }}
            >
              Agotado
            </span>
          )}
          {inStock && product.stock > 0 && product.stock <= 3 && (
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              Últimas {product.stock}
            </span>
          )}
        </div>

        {/* Free shipping overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <div
            className="flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold"
            style={{ backgroundColor: 'rgba(37,211,102,0.12)', color: '#25D366' }}
          >
            🚚 Envío gratis
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category label */}
        <p
          className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em]"
          style={{ color: '#C9A84C' }}
        >
          {product.category}
        </p>

        {/* Name — serif */}
        <h3
          className="mb-3 text-base font-semibold leading-snug text-white"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          {product.name}
        </h3>

        {/* Description */}
        <p className="mb-4 flex-1 text-sm leading-relaxed line-clamp-2" style={{ color: '#888888' }}>
          {product.description}
        </p>

        {/* Features */}
        {product.features.length > 0 && (
          <ul className="mb-4 space-y-1">
            {product.features.slice(0, 2).map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-xs" style={{ color: '#666666' }}>
                <span style={{ color: '#C9A84C' }}>✓</span>
                {feature}
              </li>
            ))}
          </ul>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Price */}
          <div className="mb-3 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">
              {formatCOP(product.price)}
            </p>
            {inStock && product.stock > 0 && product.stock <= 5 && (
              <span className="text-xs font-semibold" style={{ color: '#FF3B30' }}>
                ¡Últimas unidades!
              </span>
            )}
          </div>

          {/* CTA button — outline → filled on hover */}
          <button
            onClick={handleAdd}
            disabled={!inStock}
            aria-label={
              !inStock
                ? `${product.name} — Agotado`
                : `Agregar ${product.name} al carrito`
            }
            className={`w-full flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-250 active:scale-[0.97] ${
              !inStock
                ? 'cursor-not-allowed opacity-30'
                : added
                ? ''
                : 'hover:bg-white hover:text-[#0A0A0A]'
            }`}
            style={
              !inStock
                ? { border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.3)' }
                : added
                ? { backgroundColor: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
                : { border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF' }
            }
          >
            {!inStock ? (
              'Agotado'
            ) : added ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                </svg>
                ¡Agregado!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                AGREGAR AL CARRITO
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
