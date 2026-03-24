'use client'

import { useCart } from '@/hooks/useCart'

export default function CartButton() {
  const { openCart, itemCount } = useCart()

  return (
    <button
      onClick={openCart}
      aria-label={`Carrito de compras${itemCount > 0 ? `, ${itemCount} artículo${itemCount !== 1 ? 's' : ''}` : ''}`}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-surface-raised hover:text-primary"
    >
      {/* Shopping bag icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
        />
      </svg>

      {itemCount > 0 && (
        <span
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white"
          aria-hidden="true"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )
}
