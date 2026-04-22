'use client'

import { useEffect } from 'react'
import { ShoppingBag, X, Truck, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatCOP } from '@/lib/formatCurrency'
import CartItem from './CartItem'
import OrderForm from './OrderForm'
import DiscountInput from './DiscountInput'

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    isEmpty,
    subtotal,
    discount,
    discountAmount,
    total,
    clearCart,
    openOrderForm,
  } = useCart()

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
          className="fixed inset-0 z-50 bg-ink-strong/40 backdrop-blur-sm animate-fade-in"
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
            <h2 className="font-serif text-xl font-semibold text-ink-strong">
              Tu carrito
            </h2>
            {!isEmpty && (
              <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-white">
                {items.reduce((t, i) => t + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-light transition-colors hover:bg-surface hover:text-ink-strong"
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
                <ShoppingBag className="h-7 w-7 text-ink-light" strokeWidth={1.8} aria-hidden="true" />
              </div>
              <p className="mt-5 font-serif text-lg font-semibold text-ink-strong">
                Tu carrito está vacío
              </p>
              <p className="mt-1 text-sm text-ink-light">
                Agrega productos para continuar
              </p>
              <button
                onClick={closeCart}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.97]"
              >
                Ver productos
              </button>
            </div>
          ) : (
            <div className="py-1">
              {items.map((cartItem) => (
                <CartItem key={cartItem.product.id} item={cartItem} />
              ))}
              <button
                onClick={clearCart}
                className="mt-4 text-xs font-medium text-ink-muted transition-colors hover:text-ink-strong"
              >
                Vaciar carrito
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="space-y-4 border-t border-border bg-surface px-5 py-5">
            <DiscountInput />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-light">Subtotal</span>
                <span className="font-semibold text-ink-strong">{formatCOP(subtotal)}</span>
              </div>
              {discount && discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-light">
                    Descuento ({discount.code})
                  </span>
                  <span className="font-semibold text-ink-strong">
                    −{formatCOP(discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-1.5">
                <span className="text-sm font-semibold text-ink-strong">Total</span>
                <span className="font-serif text-xl font-bold text-ink-strong">
                  {formatCOP(total)}
                </span>
              </div>
            </div>

            {/* Informative strip */}
            <div className="chip-glass flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs text-ink-strong">
              <Truck className="h-4 w-4 flex-shrink-0 text-ink mt-0.5" strokeWidth={2} aria-hidden="true" />
              <p className="leading-snug">
                Domicilio gratis y pago contra entrega en Montería · Fuera de Montería
                coordinamos el envío por WhatsApp.
              </p>
            </div>

            {/* Single CTA — Generar orden */}
            <button
              onClick={openOrderForm}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white shadow-sm transition-all hover:bg-black active:scale-[0.98]"
            >
              Generar orden
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            </button>

            <p className="text-center text-[11px] text-ink-muted">
              Te atenderemos directo por WhatsApp para confirmar tu pedido.
            </p>
          </div>
        )}
      </div>

      {/* Order form modal — mounted alongside the drawer */}
      <OrderForm />
    </>
  )
}
