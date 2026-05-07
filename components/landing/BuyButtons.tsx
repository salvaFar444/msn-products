'use client'

import { useState } from 'react'
import { Loader2, ShoppingCart, Zap, Check } from 'lucide-react'
import {
  addToCart,
  buyNow,
  getOrCreateCart,
  isShopifyConfigured,
  type ShopifyVariant,
} from '@/lib/shopify'

interface BuyButtonsProps {
  variant: ShopifyVariant | null
  quantity: number
  /** Optional id used to coordinate visibility for sticky bar (data attribute) */
  trackingId?: string
}

/**
 * Botones combinados "Comprar ahora" + "Agregar al carrito".
 *
 * Comprar ahora → crea/agrega al carrito y redirige al checkout de Shopify.
 * Agregar al carrito → agrega y muestra un toast de confirmación.
 *
 * Si Shopify aún no está configurado, "Comprar ahora" abre WhatsApp como
 * fallback (definido en lib/shopify.ts → buyNow).
 */
export default function BuyButtons({ variant, quantity, trackingId }: BuyButtonsProps) {
  const [busy, setBusy] = useState<'buy' | 'cart' | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disabled = !variant || !variant.availableForSale

  async function handleBuyNow() {
    if (!variant) return
    setError(null)
    setBusy('buy')
    try {
      const url = await buyNow(variant.id, quantity)
      window.location.href = url
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo procesar la compra.'
      setError(msg)
      setBusy(null)
    }
  }

  async function handleAddToCart() {
    if (!variant) return
    setError(null)
    setBusy('cart')
    try {
      const cart = await getOrCreateCart()
      if (isShopifyConfigured()) {
        await addToCart(cart.id, variant.id, quantity)
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo agregar al carrito.'
      setError(msg)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-3" data-buy-buttons={trackingId ?? ''}>
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={disabled || busy !== null}
        className="group relative flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink-strong px-6 text-base font-bold uppercase tracking-wide text-white transition-all duration-200 hover:translate-y-[-1px] hover:shadow-elevated active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Comprar ahora"
      >
        {busy === 'buy' ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <Zap className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
        )}
        {busy === 'buy' ? 'Procesando…' : 'Comprar ahora'}
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full bg-ink-strong opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </button>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || busy !== null}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-ink-strong bg-white px-6 text-base font-bold uppercase tracking-wide text-ink-strong transition-all duration-200 hover:bg-ink-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Agregar al carrito"
      >
        {busy === 'cart' ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : success ? (
          <Check className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
        ) : (
          <ShoppingCart className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
        )}
        {busy === 'cart'
          ? 'Agregando…'
          : success
            ? 'Agregado'
            : 'Agregar al carrito'}
      </button>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-danger/10 px-4 py-2 text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}

      {/* Toast flotante de éxito */}
      {success && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-24 left-1/2 z-[100] flex -translate-x-1/2 animate-fade-up items-center gap-2 rounded-full bg-ink-strong px-5 py-3 text-sm font-semibold text-white shadow-elevated md:bottom-6"
        >
          <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
          Agregado al carrito
        </div>
      )}
    </div>
  )
}
