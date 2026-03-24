/**
 * /checkout/success
 *
 * MercadoPago redirects here after the user completes (or abandons) checkout.
 * URL params injected by MP:
 *   payment_id          — numeric payment ID
 *   status              — approved | pending | failure | null
 *   preference_id       — the preference we created
 *   external_reference  — same as preference_id in our setup
 *
 * This page:
 *  1. Reads those params (Server Component, no client JS needed)
 *  2. Verifies the payment with MP API (prevents spoofed success URLs)
 *  3. Updates order status + reduces stock in Supabase (idempotent guard)
 *  4. Renders the appropriate UI: approved / pending / failure
 */

import Link from 'next/link'
import { getOrderByPreferenceId, updateOrderStatus } from '@/lib/orders'
import { reduceStockForItems } from '@/lib/stock'
import type { OrderItem } from '@/types'

// ─── MP payment verification ─────────────────────────────────────────────────

interface MPPayment {
  status: string
  preference_id?: string
  external_reference?: string
}

async function verifyPayment(paymentId: string): Promise<MPPayment | null> {
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken || !paymentId) return null

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      // Server-side fetch — no caching, always fresh
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ─── Idempotent order sync (safe to call multiple times) ─────────────────────

async function syncOrder(payment: MPPayment, paymentId: string) {
  const lookupId = payment.external_reference || payment.preference_id
  if (!lookupId) return

  const order = await getOrderByPreferenceId(lookupId)
  if (!order) return

  const wasAlreadyApproved = order.status === 'approved'
  const mapped =
    payment.status === 'approved'
      ? ('approved' as const)
      : payment.status === 'rejected' || payment.status === 'cancelled'
        ? ('rejected' as const)
        : ('pending' as const)

  await updateOrderStatus(order.id, mapped, paymentId)

  if (mapped === 'approved' && !wasAlreadyApproved) {
    await reduceStockForItems(order.items as OrderItem[])
  }
}

// ─── UI sub-components ────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: 'approved' | 'pending' | 'failure' }) {
  if (status === 'approved') {
    return (
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F0FFF4] border-2 border-[#22C55E]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#22C55E" className="h-10 w-10" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
    )
  }
  if (status === 'pending') {
    return (
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFFBEB] border-2 border-[#F59E0B]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#F59E0B" className="h-10 w-10" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
    )
  }
  return (
    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1F2] border-2 border-[#F43F5E]">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#F43F5E" className="h-10 w-10" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </div>
  )
}

const CONTENT = {
  approved: {
    title: '¡Pago confirmado!',
    subtitle: 'Tu pedido está en camino. Recibirás un correo con el detalle del envío.',
    cta: 'Seguir comprando',
  },
  pending: {
    title: 'Pago en proceso',
    subtitle: 'Tu pago está siendo verificado. Te notificaremos por correo cuando sea aprobado.',
    cta: 'Volver al inicio',
  },
  failure: {
    title: 'Pago no completado',
    subtitle: 'El pago no pudo procesarse. Puedes intentarlo de nuevo o elegir otro método.',
    cta: 'Intentar de nuevo',
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface SearchParams {
  payment_id?: string
  status?: string
  preference_id?: string
  external_reference?: string
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const paymentId = searchParams.payment_id ?? ''
  const rawStatus = searchParams.status ?? ''

  // ── Server-side verification ─────────────────────────────────────
  let verifiedStatus: 'approved' | 'pending' | 'failure' = 'pending'

  if (paymentId) {
    const payment = await verifyPayment(paymentId)
    if (payment) {
      await syncOrder(payment, paymentId)
      if (payment.status === 'approved') verifiedStatus = 'approved'
      else if (payment.status === 'rejected' || payment.status === 'cancelled') verifiedStatus = 'failure'
      else verifiedStatus = 'pending'
    } else {
      // Couldn't verify — trust MP's status param as fallback
      if (rawStatus === 'approved') verifiedStatus = 'approved'
      else if (rawStatus === 'failure') verifiedStatus = 'failure'
    }
  } else if (rawStatus === 'approved') {
    verifiedStatus = 'approved'
  } else if (rawStatus === 'failure') {
    verifiedStatus = 'failure'
  }

  const content = CONTENT[verifiedStatus]
  const ctaHref = verifiedStatus === 'failure' ? '/checkout' : '/'

  // ── Render ───────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 pt-20 pb-16">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-border bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)] px-8 py-10 text-center">
          <StatusIcon status={verifiedStatus} />

          <h1 className="text-2xl font-bold text-primary mb-2">{content.title}</h1>
          <p className="text-sm text-muted mb-8 leading-relaxed">{content.subtitle}</p>

          {/* Payment ID badge */}
          {paymentId && (
            <div className="mb-8 rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-muted font-medium mb-0.5">
                Referencia de pago
              </p>
              <p className="font-mono text-sm font-semibold text-primary">{paymentId}</p>
            </div>
          )}

          {/* CTA button */}
          <Link
            href={ctaHref}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-8 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            {content.cta}
          </Link>

          {/* Brand footer */}
          <p className="mt-8 text-[11px] text-muted">
            MSN Products · Accesorios Apple en Colombia
          </p>
        </div>

        {/* Powered by MP */}
        <p className="mt-4 text-center text-[11px] text-muted">
          Pago procesado por{' '}
          <span className="font-medium text-primary">MercadoPago</span>
        </p>
      </div>
    </main>
  )
}
