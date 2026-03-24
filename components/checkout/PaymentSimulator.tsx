'use client'

/**
 * PaymentSimulator — unified payment gateway component.
 *
 * All real payments go through MercadoPago Checkout Pro, which natively
 * includes Nequi, PSE, and card options inside its hosted checkout.
 * The direct Nequi API integration has been removed; Nequi is surfaced
 * as a highlighted method inside the MP checkout.
 */

import { useState } from 'react'
import { formatCOP } from '@/lib/formatCurrency'
import { WHATSAPP_CHECKOUT_URL } from '@/lib/constants'
import type { CartItem, CheckoutFormData } from '@/types'

interface PaymentSimulatorProps {
  total: number
  items: CartItem[]
  formData: CheckoutFormData | null
  onPay: () => Promise<void>   // used only for simulation fallback
  loading: boolean
}

// ── SVG icon components ──────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className="h-8 w-8 text-success"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PaymentSimulator({
  total,
  items,
  formData,
  onPay,
  loading,
}: PaymentSimulatorProps) {
  const [mpLoading, setMpLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [simSuccess, setSimSuccess] = useState(false)

  const isLoading = loading || mpLoading

  // WhatsApp fallback text (used only after simulation)
  const orderText = items
    .map((i) => `• ${i.product.name} x${i.quantity} = ${formatCOP(i.product.price * i.quantity)}`)
    .join('\n')
  const fullOrderText = `${orderText}\n\nTotal: ${formatCOP(total)}`

  // ── Main payment handler — creates MP preference and redirects ────
  const handlePay = async () => {
    if (isLoading) return
    setError(null)
    setMpLoading(true)

    try {
      const res = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
          })),
          customer: formData,
          total,
        }),
      })

      const data = await res.json()

      if (data.mode === 'live' && data.init_point) {
        // Redirect to MP Checkout Pro (Nequi + PSE pre-selected)
        window.location.href = data.init_point
        return  // page navigates away; don't reset loading state
      }

      // No MP credentials configured → simulation fallback
      await onPay()
      setSimSuccess(true)
    } catch {
      setError('No se pudo conectar con el servidor de pagos. Intenta nuevamente.')
    } finally {
      setMpLoading(false)
    }
  }

  // ── Simulation success screen (shown when MP_ACCESS_TOKEN is absent) ─
  if (simSuccess) {
    return (
      <div className="card p-8 text-center animate-scale-in">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <CheckIcon />
        </div>
        <h3 className="mb-2 text-xl font-bold text-primary">¡Pedido recibido!</h3>
        <p className="mb-6 text-sm text-muted">
          Gracias por tu compra. Te contactaremos pronto para confirmar el envío.
        </p>
        <a
          href={WHATSAPP_CHECKOUT_URL(fullOrderText)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-whatsapp px-6 py-3 text-sm font-semibold text-white hover:bg-[#1db954] transition-colors shadow-lg shadow-whatsapp/20"
        >
          {/* WhatsApp icon */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Confirmar por WhatsApp
        </a>
      </div>
    )
  }

  // ── Main payment card ─────────────────────────────────────────────
  return (
    <div className="card p-6 space-y-5">
      <h2 className="text-lg font-semibold text-primary">Método de pago</h2>

      {/* MercadoPago — primary option */}
      <div className="rounded-2xl border-2 border-accent bg-accent-muted p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">💳</span>
          <div>
            <p className="text-sm font-semibold text-primary leading-none">MercadoPago</p>
            <p className="text-xs text-muted mt-0.5">Checkout seguro y encriptado</p>
          </div>
          <span className="ml-auto text-[10px] font-medium bg-accent text-white px-2 py-0.5 rounded-full">
            Recomendado
          </span>
        </div>

        {/* Accepted methods */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-primary">
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
              style={{ background: '#8347AD' }}
              aria-hidden="true"
            >
              N
            </span>
            Nequi
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-primary">
            🏦 PSE
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-primary">
            💳 Tarjetas
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-danger animate-fade-in">{error}</p>
      )}

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={isLoading}
        aria-busy={isLoading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <SpinnerIcon />
            Generando enlace de pago…
          </>
        ) : (
          `Pagar ${formatCOP(total)} con MercadoPago`
        )}
      </button>

      {/* Trust line */}
      <p className="text-center text-[11px] text-muted">
        Serás redirigido al checkout seguro de MercadoPago.{' '}
        <span className="font-medium text-primary">MSN Products</span> nunca ve tus datos bancarios.
      </p>
    </div>
  )
}
