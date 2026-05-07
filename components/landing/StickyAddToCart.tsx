'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Zap, Loader2 } from 'lucide-react'
import { formatCOP } from '@/lib/formatCurrency'
import { buyNow, type ShopifyProduct, type ShopifyVariant } from '@/lib/shopify'

interface StickyAddToCartProps {
  product: ShopifyProduct
  variant: ShopifyVariant | null
  quantity: number
  /**
   * id del elemento que, al salir del viewport, dispara la aparición
   * de la barra. Por defecto: 'hero-cta'.
   */
  triggerId?: string
}

/**
 * Barra fija inferior visible solo en móvil cuando el CTA principal sale
 * del viewport. Imagen + nombre + precio + botón "Comprar".
 */
export default function StickyAddToCart({
  product,
  variant,
  quantity,
  triggerId = 'hero-cta',
}: StickyAddToCartProps) {
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const target = document.getElementById(triggerId)
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Visible cuando el CTA principal NO está en pantalla
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '0px 0px -120px 0px' }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [triggerId])

  async function handleBuy() {
    if (!variant) return
    setBusy(true)
    try {
      const url = await buyNow(variant.id, quantity)
      window.location.href = url
    } catch (e) {
      console.error(e)
      setBusy(false)
    }
  }

  const cover = product.images[0]
  const price = variant?.price

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-white/95 backdrop-blur-md transition-transform duration-300 md:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center gap-3 p-3">
        {cover && (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
            <Image
              src={cover.url}
              alt={cover.altText ?? product.title}
              fill
              sizes="48px"
              className="object-contain p-1"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-ink-strong">
            {product.title}
          </p>
          {price && (
            <p className="text-sm font-extrabold text-ink-strong">
              {formatCOP(Number(price.amount))}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleBuy}
          disabled={!variant || busy}
          className="flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-ink-strong px-5 text-xs font-bold uppercase tracking-wide text-white transition-all duration-200 active:scale-95 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Zap className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
          )}
          Comprar
        </button>
      </div>
    </div>
  )
}
