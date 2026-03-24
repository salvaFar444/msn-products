import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/orders'

async function getNequiToken(clientId: string, clientSecret: string, apiUrl: string) {
  const res = await fetch(`${apiUrl}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!res.ok) throw new Error(`Nequi OAuth failed: ${res.status}`)
  const data = await res.json()
  return data.access_token as string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone, amount, items, customer } = body

    const clientId = process.env.NEQUI_CLIENT_ID
    const clientSecret = process.env.NEQUI_CLIENT_SECRET
    const apiUrl = process.env.NEQUI_API_URL || 'https://api.nequi.com.co'

    if (!clientId || !clientSecret) {
      return NextResponse.json({ mode: 'mercadopago_fallback' })
    }

    const token = await getNequiToken(clientId, clientSecret, apiUrl)

    const messageId = `msn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const pushRes = await fetch(`${apiUrl}/payments/gateway/push/`, {
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
            Destination: { ServiceName: 'PaymentService', ServiceOperation: 'pushPayment', ServiceRegion: 'CO', ServiceVersion: '1.2.0' },
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

    // Persist pending order
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

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
}
