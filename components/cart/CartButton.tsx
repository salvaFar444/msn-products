'use client'

import { useEffect, useRef, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

export default function CartButton() {
  const { openCart, itemCount } = useCart()
  const prevCountRef = useRef(itemCount)
  const [popKey, setPopKey] = useState(0)

  // Trigger the cart-pop animation whenever the cart count goes up
  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setPopKey((k) => k + 1)
    }
    prevCountRef.current = itemCount
  }, [itemCount])

  return (
    <button
      onClick={openCart}
      aria-label={`Carrito de compras${itemCount > 0 ? `, ${itemCount} artículo${itemCount !== 1 ? 's' : ''}` : ''}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-ink-strong transition-all duration-200 hover:border-ink-strong hover:bg-surface active:scale-95"
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />

      {itemCount > 0 && (
        <span
          key={popKey}
          className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white shadow-sm animate-cart-pop"
          aria-hidden="true"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )
}
