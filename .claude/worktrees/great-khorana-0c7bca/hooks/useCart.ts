'use client'

import { useCartStore } from '@/store/cartStore'
import { useMemo } from 'react'
import { computeDiscountAmount } from '@/lib/discounts'

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

  const discountAmount = useMemo(() => {
    if (!store.discount) return 0
    return computeDiscountAmount(
      subtotal,
      store.discount.discountType,
      store.discount.discountValue
    )
  }, [store.discount, subtotal])

  const total = Math.max(0, subtotal - discountAmount)
  const isEmpty = store.items.length === 0

  return {
    ...store,
    itemCount,
    subtotal,
    discountAmount,
    total,
    isEmpty,
  }
}
