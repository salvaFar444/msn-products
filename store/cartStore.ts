'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartStore, Product } from '@/types'
import { CART_STORAGE_KEY } from '@/lib/constants'

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isOrderFormOpen: false,

      addItem: (product: Product) => {
        if (product.stock === 0) return // Don't add out-of-stock items

        const items = get().items
        const existing = items.find((i) => i.product.id === product.id)

        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
                : i
            ),
            isOpen: true,
          })
        } else {
          set({
            items: [...items, { product, quantity: 1 }],
            isOpen: true,
          })
        }
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () =>
        set({ items: [], isOrderFormOpen: false }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false, isOrderFormOpen: false }),

      openOrderForm: () => set({ isOrderFormOpen: true }),
      closeOrderForm: () => set({ isOrderFormOpen: false }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)
