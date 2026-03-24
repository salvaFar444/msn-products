'use client'

import { useState } from 'react'
import { formatCOP } from '@/lib/formatCurrency'
import { WHATSAPP_CHECKOUT_URL } from '@/lib/constants'
import NequiPaymentInput from './NequiPaymentInput'
import type { PaymentMethod, CartItem, CheckoutFormData } from '@/types'

interface PaymentSimulatorProps {
  total: number
  items: CartItem[]
  formData: CheckoutFormData | null
  onPay: () => Promise<void>
  loading: boolean
}

export default function PaymentSimulator({
  total,
  items,
  formData,
  onPay,
  loading,
}: PaymentSimulatorProps) {
  const [method, setMethod] = useState<PaymentMethod | null>(null)
  const [success, setSuccess] = useState(false)
  const [mpLoading, setMpLoading] = useState(false)
  const [mpError, setMpError] = useState<string | null>(null)

  const orderText = items
    .map((i) => `• ${i.product.name} x${i.quantity} = ${formatCOP(i.product.price * i.quantity)}`)
    .join('\n')
  const fullOrderText = `${orderText}\n\nTotal: ${formatCOP(total)}`

  const handleSimPay = async () => {
    if (!method) return
    await onPay()
    setSuccess(true)
  }

  const handleMercadoPago = async () => {
    setMpLoading(true)
    setMpError(null)
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
        window.location.href = data.init_point
      } else {
        // Simulation fallback
        await handleSimPay()
      }
    } catch {
      // Network error — fall back to simulation
      await handleSimPay()
    } finally {
      setMpLoading(false)
    }
  }

  const handleNequiSuccess = async () => {
    await onPay()
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="card p-8 text-center animate-scale-in">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8 text-success"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
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
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Confirmar por WhatsApp
        </a>
      </div>
    )
  }

  return (
    <div className="card p-6 space-y-5">
      <h2 className="text-lg font-semibold text-primary">Método de pago</h2>

      {/* Method selector */}
      <div className="grid grid-cols-3 gap-3">
        {(['mercadopago', 'nequi', 'wompi'] as PaymentMethod[]).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            aria-pressed={method === m}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all duration-200 ${
              method === m
                ? 'border-accent bg-accent-muted'
                : 'border-border hover:border-border-strong'
            }`}
          >
            {m === 'mercadopago' && (
              <span className="text-xl" aria-hidden="true">💳</span>
            )}
            {m === 'nequi' && (
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white"
                style={{ background: '#8347AD' }}
                aria-hidden="true"
              >
                N
              </span>
            )}
            {m === 'wompi' && (
              <span className="text-xl" aria-hidden="true">🏦</span>
            )}
            <span className="text-xs font-medium text-primary capitalize leading-none text-center">
              {m === 'mercadopago' ? 'MercadoPago' : m === 'nequi' ? 'Nequi' : 'Wompi'}
            </span>
          </button>
        ))}
      </div>

      {/* Nequi flow */}
      {method === 'nequi' && (
        <NequiPaymentInput
          total={total}
          items={items}
          formData={formData}
          onSuccess={handleNequiSuccess}
        />
      )}

      {/* Simulated card form for MP (no env) / Wompi */}
      {method && method !== 'nequi' && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            {method === 'mercadopago' ? 'MercadoPago' : 'Wompi'} — Checkout Pro
          </p>
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            defaultValue="4242 4242 4242 4242"
            readOnly
            className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-primary outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="MM/AA"
              defaultValue="12/27"
              readOnly
              className="rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-primary outline-none"
            />
            <input
              type="text"
              placeholder="CVV"
              defaultValue="123"
              readOnly
              className="rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-primary outline-none"
            />
          </div>
          {mpError && (
            <p className="text-xs text-danger">{mpError}</p>
          )}
          <p className="text-[11px] text-muted">
            Este es un checkout de demostración. No se realizarán cargos reales.
          </p>
        </div>
      )}

      {/* Pay button (not shown for Nequi — NequiPaymentInput has its own) */}
      {method && method !== 'nequi' && (
        <button
          onClick={method === 'mercadopago' ? handleMercadoPago : handleSimPay}
          disabled={loading || mpLoading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading || mpLoading ? (
            <>
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
              Procesando...
            </>
          ) : (
            `Pagar ${formatCOP(total)}`
          )}
        </button>
      )}

      {/* No method selected hint */}
      {!method && (
        <p className="text-center text-xs text-muted">
          Selecciona un método de pago para continuar
        </p>
      )}
    </div>
  )
}
