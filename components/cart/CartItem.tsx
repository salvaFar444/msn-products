'use client'

import Image from 'next/image'
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
    <div className="flex gap-4 py-4 border-b border-white/5 last:border-0">
      {/* Image */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-raised">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="64px"
          className="object-contain p-1"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-white leading-snug line-clamp-2">
            {product.name}
          </p>
          {/* Remove */}
          <button
            onClick={() => removeItem(product.id)}
            aria-label={`Eliminar ${product.name} del carrito`}
            className="flex-shrink-0 rounded-md p-1 text-muted hover:text-danger transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Qty controls */}
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              aria-label="Reducir cantidad"
              className="flex h-7 w-7 items-center justify-center text-muted hover:bg-white/5 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-3 w-3"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            </button>
            <span className="flex h-7 w-8 items-center justify-center text-sm font-medium text-white">
              {quantity}
            </span>
            <button
              onClick={() =>
                updateQuantity(product.id, Math.min(quantity + 1, product.stock))
              }
              aria-label="Aumentar cantidad"
              disabled={quantity >= product.stock}
              className="flex h-7 w-7 items-center justify-center text-muted hover:bg-white/5 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-3 w-3"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </div>

          {/* Line total */}
          <p className="text-sm font-semibold text-white">
            {formatCOP(product.price * quantity)}
          </p>
        </div>
      </div>
    </div>
  )
}
