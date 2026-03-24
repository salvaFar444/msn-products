'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { formatCOP } from '@/lib/formatCurrency'
import CartItem from './CartItem'

export default function CartDrawer() {
  const { isOpen, closeCart, items, isEmpty, subtotal, clearCart } = useCart()

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('cart-open')
    } else {
      document.body.classList.remove('cart-open')
    }
    return () => document.body.classList.remove('cart-open')
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeCart()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, closeCart])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-primary">Tu carrito</h2>
            {!isEmpty && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                {items.reduce((t, i) => t + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-primary transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-lg font-medium text-primary mb-1">Tu carrito está vacío</p>
              <p className="text-sm text-muted mb-6">
                Agrega productos para continuar
              </p>
              <button
                onClick={closeCart}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
              >
                Ver productos
              </button>
            </div>
          ) : (
            <div className="py-2">
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
              <button
                onClick={clearCart}
                className="mt-3 text-xs text-muted hover:text-danger transition-colors"
              >
                Vaciar carrito
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t border-border px-5 py-5 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="text-lg font-bold text-primary">{formatCOP(subtotal)}</span>
            </div>
            <p className="text-xs text-muted">
              Envío calculado al momento del pago
            </p>
            {/* CTA */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-accent text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover active:scale-[0.97]"
            >
              Ir al checkout
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="ml-2 h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
