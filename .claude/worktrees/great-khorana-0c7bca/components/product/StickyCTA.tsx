'use client'

import { Check, ShoppingCart } from 'lucide-react'
import { formatCOP } from '@/lib/formatCurrency'

interface StickyCTAProps {
  price: number
  inStock: boolean
  added: boolean
  onAdd: () => void
}

// Mobile-only sticky bar at the bottom of the detail page. Keeps the
// add-to-cart CTA always within thumb reach while the user scrolls
// through specs, reviews, and related products.
export default function StickyCTA({ price, inStock, added, onAdd }: StickyCTAProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden"
      style={{ boxShadow: '0 -8px 24px rgba(0,0,0,0.08)' }}
      role="region"
      aria-label="Compra rápida"
    >
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-light">Total</p>
          <p className="text-lg font-extrabold leading-none text-ink-strong">
            {formatCOP(price)}
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={!inStock}
          className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all duration-200 active:scale-[0.97] ${
            !inStock
              ? 'cursor-not-allowed bg-surface text-ink-muted'
              : added
                ? 'border border-success/40 bg-success/10 text-success'
                : 'bg-primary text-white shadow-md'
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
              <ShoppingCart className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />
              Agregar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
