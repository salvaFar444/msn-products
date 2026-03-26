'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { formatCOP } from '@/lib/formatCurrency'
import { WHATSAPP_CHECKOUT_URL } from '@/lib/constants'
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
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: '#111111' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <h2
              className="text-lg font-semibold text-white"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Tu carrito
            </h2>
            {!isEmpty && (
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#C9A84C', color: '#0A0A0A' }}
              >
                {items.reduce((t, i) => t + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ color: '#888888' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#888888')}
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
              <p className="text-lg font-semibold text-white mb-1" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Tu carrito está vacío</p>
              <p className="text-sm mb-6" style={{ color: '#888888' }}>
                Agrega productos para continuar
              </p>
              <button
                onClick={closeCart}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FFFFFF', color: '#0A0A0A' }}
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
          <div
            className="px-5 py-5 space-y-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#888888' }}>Subtotal</span>
              <span className="text-lg font-bold text-white">{formatCOP(subtotal)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#25D366' }}>
              <span>🚚</span>
              <span>Envío gratis incluido</span>
            </div>
            {/* Primary CTA — checkout */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
              style={{ backgroundColor: '#FFFFFF', color: '#0A0A0A' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.9')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
            >
              Ir al checkout
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            {/* Secondary CTA — WhatsApp */}
            <a
              href={WHATSAPP_CHECKOUT_URL(
                items.map((i) => `• ${i.product.name} x${i.quantity} — ${formatCOP(i.product.price * i.quantity)}`).join('\n') +
                `\n\nTotal: ${formatCOP(subtotal)}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeCart}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.97]"
              style={{ backgroundColor: 'rgba(37,211,102,0.1)', color: '#25D366', border: '1px solid rgba(37,211,102,0.2)' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Pedir por WhatsApp
            </a>
          </div>
        )}
      </div>
    </>
  )
}
