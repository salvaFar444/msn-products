'use client'

import { useState } from 'react'
import { Check, ShoppingCart, ShieldCheck, Truck, CreditCard } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatCOP } from '@/lib/formatCurrency'
import QuantitySelector from './QuantitySelector'
import StickyCTA from './StickyCTA'
import type { Product } from '@/types'
import { SITE } from '@/data/site'

interface ProductDetailClientProps {
  product: Product
}

// Client island on the detail page — owns the "add to cart" interaction,
// the quantity selector, and the mobile sticky CTA. Kept separate from
// the server component so server-side renders the bulk of the page for
// SEO and only this interactive chunk is sent as client JS.
export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const inStock = product.stock > 0
  const maxQty = Math.max(1, product.stock)

  const handleAdd = () => {
    if (!inStock || added) return
    for (let i = 0; i < qty; i++) addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <>
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <p className="text-4xl font-extrabold text-ink-strong">
          {formatCOP(product.price)}
        </p>
        {inStock && product.stock <= 5 && (
          <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-bold text-danger">
            ¡Últimas {product.stock} unidades!
          </span>
        )}
        {!inStock && (
          <span className="rounded-full bg-ink-muted/10 px-3 py-1 text-xs font-bold text-ink-muted">
            Agotado
          </span>
        )}
      </div>

      {/* Trust signals */}
      <ul className="grid grid-cols-1 gap-2 text-sm text-ink">
        <li className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-success" aria-hidden="true" strokeWidth={2.4} />
          <span>
            <strong>Domicilio gratis</strong> dentro de {SITE.freeDeliveryCity}.
          </span>
        </li>
        <li className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-success" aria-hidden="true" strokeWidth={2.4} />
          <span>
            <strong>{SITE.paymentMethod}</strong> — recibes primero, pagas después.
          </span>
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" strokeWidth={2.4} />
          <span>
            <strong>{SITE.warrantyMonths} meses</strong> de garantía directa con nosotros.
          </span>
        </li>
      </ul>

      {/* Quantity */}
      {inStock && (
        <QuantitySelector value={qty} min={1} max={maxQty} onChange={setQty} />
      )}

      {/* Primary CTA */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!inStock}
        aria-label={
          !inStock
            ? `${product.name} agotado`
            : `Agregar ${qty} × ${product.name} al carrito`
        }
        className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold uppercase tracking-wide transition-all duration-200 active:scale-[0.98] ${
          !inStock
            ? 'cursor-not-allowed bg-surface text-ink-muted'
            : added
              ? 'border border-success/40 bg-success/10 text-success'
              : 'bg-primary text-white shadow-lg hover:opacity-95'
        }`}
      >
        {!inStock ? (
          'Agotado'
        ) : added ? (
          <>
            <Check className="h-5 w-5" aria-hidden="true" strokeWidth={3} />
            ¡Agregado al carrito!
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" aria-hidden="true" strokeWidth={2.5} />
            Agregar al carrito
          </>
        )}
      </button>

      <p className="text-xs text-ink-light">
        ¿Dudas? Coordina por WhatsApp y te asesoramos personalmente antes de enviarlo.
      </p>

      <StickyCTA
        price={product.price}
        onAdd={handleAdd}
        added={added}
        inStock={inStock}
      />
    </>
  )
}
