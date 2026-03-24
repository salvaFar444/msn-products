'use client'

import { useCartStore } from '@/store/cartStore'
import { useMemo } from 'react'

export function useCart() {
  const store = useCartStore()

  const itemCount = useMemo(
    () => store.items.reduce((total, item) => total + item.quantity, 0),
    [store.items]
  )

  const subtotal = useMemo(
    () =>
      store.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      ),
    [store.items]
  )

  const isEmpty = store.items.length === 0

  return {
    ...store,
    itemCount,
    subtotal,
    isEmpty,
  }
}
