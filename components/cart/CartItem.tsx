'use client'

import Image from 'next/image'
import { Minus, Plus, X } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatCOP } from '@/lib/formatCurrency'
import type { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart()
  const { product, quantity } = item

  return (
    <div className="flex gap-4 border-b border-border py-5 last:border-0">
      {/* Image */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="80px"
          className="object-contain p-2"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between gap-2 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-ink-strong leading-snug line-clamp-2">
            {product.name}
          </p>
          <button
            onClick={() => removeItem(product.id)}
            aria-label={`Eliminar ${product.name} del carrito`}
            className="flex-shrink-0 rounded-md p-1 text-ink-muted transition-colors hover:bg-surface hover:text-ink-strong"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Qty controls */}
          <div className="flex items-center overflow-hidden rounded-lg border border-border bg-white">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              aria-label="Reducir cantidad"
              className="flex h-8 w-8 items-center justify-center text-ink-light transition-colors hover:bg-surface hover:text-ink-strong"
            >
              <Minus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </button>
            <span className="flex h-8 w-8 items-center justify-center text-sm font-semibold text-ink-strong">
              {quantity}
            </span>
            <button
              onClick={() =>
                updateQuantity(product.id, Math.min(quantity + 1, product.stock))
              }
              aria-label="Aumentar cantidad"
              disabled={quantity >= product.stock}
              className="flex h-8 w-8 items-center justify-center text-ink-light transition-colors hover:bg-surface hover:text-ink-strong disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          {/* Line total */}
          <p className="text-sm font-bold text-ink-strong">
            {formatCOP(product.price * quantity)}
          </p>
        </div>
      </div>
    </div>
  )
}
