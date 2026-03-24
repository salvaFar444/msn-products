import { NextRequest, NextResponse } from 'next/server'
import { getOrderByPreferenceId, updateOrderStatus } from '@/lib/orders'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (type !== 'payment' || !data?.id) {
      return NextResponse.json({ ok: true })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ ok: true })
    }

    // Fetch payment details from MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!mpRes.ok) {
      console.error('[MP webhook] failed to fetch payment', mpRes.status)
      return NextResponse.json({ ok: true })
    }

    const payment = await mpRes.json()
    const { status, external_reference, preference_id } = payment

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
        await updateOrderStatus(order.id, mapped, String(data.id))
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[MP webhook]', err)
    // Always return 200 so MP doesn't retry
    return NextResponse.json({ ok: true })
  }
}
