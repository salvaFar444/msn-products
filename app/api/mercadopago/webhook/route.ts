/**
 * POST /api/mercadopago/webhook
 *
 * Receives MercadoPago IPN/webhook notifications.
 * On payment approval: updates order status in Supabase and reduces stock.
 * Always returns 200 — MP retries on non-2xx responses.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOrderByPreferenceId, updateOrderStatus } from '@/lib/orders'
import { reduceStockForItems } from '@/lib/stock'
import type { OrderItem } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    // We only handle payment notifications
    if (type !== 'payment' || !data?.id) {
      return NextResponse.json({ ok: true })
    }

    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ ok: true })
    }

    // ── Fetch payment details from MercadoPago ───────────────────────
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!mpRes.ok) {
      console.error('[MP webhook] failed to fetch payment', mpRes.status)
      return NextResponse.json({ ok: true })
    }

    const payment = await mpRes.json()
    const { status, external_reference, preference_id } = payment

    // ── Map MP status to our OrderStatus ────────────────────────────
    const statusMap: Record<string, 'approved' | 'rejected' | 'cancelled' | 'pending'> = {
      approved: 'approved',
      rejected: 'rejected',
      cancelled: 'cancelled',
      pending: 'pending',
      in_process: 'pending',
      in_mediation: 'pending',
      charged_back: 'rejected',
      refunded: 'cancelled',
    }

    const mapped = statusMap[status] ?? 'pending'
    const lookupId = external_reference || preference_id

    if (lookupId) {
      const order = await getOrderByPreferenceId(lookupId)
      if (order) {
        const wasAlreadyApproved = order.status === 'approved'

        await updateOrderStatus(order.id, mapped, String(data.id))

        // Reduce stock exactly once when a payment transitions to approved
        if (mapped === 'approved' && !wasAlreadyApproved) {
          await reduceStockForItems(order.items as OrderItem[])
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[MP webhook]', err)
    return NextResponse.json({ ok: true })
  }
}
