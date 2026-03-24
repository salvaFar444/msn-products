import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/orders'
import { getNequiToken, hasNequiCredentials, NEQUI_API_URL } from '@/lib/nequi'

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone, amount, items, customer } = body

    if (!hasNequiCredentials()) {
      return NextResponse.json({ mode: 'mercadopago_fallback' })
    }

    const token = await getNequiToken()
    const clientId = process.env.NEQUI_CLIENT_ID || 'MSN'
    const messageId = `msn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const pushRes = await fetch(`${NEQUI_API_URL}/payments/gateway/push/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        RequestMessage: {
          RequestHeader: {
            Channel: 'MSN',
            RequestDate: new Date().toISOString(),
            MessageID: messageId,
            ClientID: clientId,
            Destination: {
              ServiceName: 'PaymentService',
              ServiceOperation: 'pushPayment',
              ServiceRegion: 'CO',
              ServiceVersion: '1.2.0',
            },
          },
          RequestBody: {
            any: {
              pushPaymentRQ: {
                phoneNumber: phone,
                message: `Pago MSN Products ${formatAmount(amount)}`,
                value: String(amount),
              },
            },
          },
        },
      }),
    })

    if (!pushRes.ok) {
      const errText = await pushRes.text()
      console.error('[Nequi push]', pushRes.status, errText)
      return NextResponse.json({ mode: 'mercadopago_fallback' })
    }

    const pushData = await pushRes.json()
    const transactionId =
      pushData?.ResponseMessage?.ResponseBody?.any?.pushPaymentRS?.transactionId ?? messageId

    await createOrder({
      mp_preference_id: transactionId,
      mp_payment_id: null,
      status: 'pending',
      items,
      customer: customer ?? {},
      total: amount,
    })

    return NextResponse.json({ transactionId, mode: 'nequi' })
  } catch (err) {
    console.error('[Nequi push]', err)
    return NextResponse.json({ mode: 'mercadopago_fallback' })
  }
}
