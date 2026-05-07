'use client'

import { useState } from 'react'
import { Loader2, ShoppingCart, Zap, Check } from 'lucide-react'
import { buildCartPermalink, type ShopifyVariant } from '@/lib/shopify'

interface BuyButtonsProps {
  variant: ShopifyVariant | null
  quantity: number
  /** Dominio público de Shopify — pasado desde el server component */
  shopDomain: string
  /** Optional id used to coordinate visibility for sticky bar (data attribute) */
  trackingId?: string
}

const CART_STORAGE_KEY = 'msn-shopify-pending-cart'

interface PendingCart {
  variantId: string
  quantity: number
  addedAt: number
}

/**
 * Botones combinados "Comprar ahora" + "Agregar al carrito".
 *
 * Comprar ahora → redirige al cart permalink de Shopify
 *                 (https://{shop}/cart/{variantId}:{qty}) que abre el
 *                 checkout nativo. No necesita ningún API token en el
 *                 browser, todo lo resuelve Shopify.
 *
 * Agregar al carrito → guarda el item pendiente en localStorage y muestra
 *                 toast. Cuando el usuario haga "Comprar ahora", el
 *                 permalink incluye el item.
 */
export default function BuyButtons({
  variant,
  quantity,
  shopDomain,
  trackingId,
}: BuyButtonsProps) {
  const [busy, setBusy] = useState<'buy' | 'cart' | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disabled = !variant

  function handleBuyNow() {
    if (!variant) return
    setError(null)
    setBusy('buy')
    try {
      const url = buildCartPermalink(variant.id, quantity, shopDomain)
      window.location.href = url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo procesar la compra.')
      setBusy(null)
    }
  }

  function handleAddToCart() {
    if (!variant) return
    setError(null)
    setBusy('cart')
    try {
      // Persistimos el item pendiente. Como el checkout final lo maneja
      // Shopify vía cart permalink, esto solo refleja la intención del
      // usuario para mostrar el ítem en la sticky bar móvil y permitir
      // un click rápido a "Comprar ahora" después.
      const pending: PendingCart = {
        variantId: variant.id,
        quantity,
        addedAt: Date.now(),
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(pending))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo agregar al carrito.')
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
