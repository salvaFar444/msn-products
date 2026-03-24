import { NextRequest, NextResponse } from 'next/server'
import { getOrderByPreferenceId, updateOrderStatus } from '@/lib/orders'

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ status: 'failed' }, { status: 400 })
    }

    const clientId = process.env.NEQUI_CLIENT_ID
    const clientSecret = process.env.NEQUI_CLIENT_SECRET
    const apiUrl = process.env.NEQUI_API_URL || 'https://api.nequi.com.co'

    if (!clientId || !clientSecret) {
      return NextResponse.json({ status: 'failed' })
    }

    const token = await getNequiToken(clientId, clientSecret, apiUrl)

    const statusRes = await fetch(`${apiUrl}/payments/gateway/push/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!statusRes.ok) {
      console.error('[Nequi status]', statusRes.status)
      return NextResponse.json({ status: 'pending' })
    }

    const data = await statusRes.json()
    const rawStatus: string =
      data?.ResponseMessage?.ResponseBody?.any?.getPaymentStatusRS?.status ?? 'PENDING'

    const statusMap: Record<string, 'approved' | 'pending' | 'failed'> = {
      SUCCESS: 'approved',
      APPROVED: 'approved',
      PENDING: 'pending',
      IN_PROGRESS: 'pending',
      FAILED: 'failed',
      REJECTED: 'failed',
      CANCELLED: 'failed',
      EXPIRED: 'failed',
    }

    const mapped = statusMap[rawStatus.toUpperCase()] ?? 'pending'

    // Persist final states to Supabase
    if (mapped === 'approved' || mapped === 'failed') {
      const order = await getOrderByPreferenceId(id)
      if (order) {
        await updateOrderStatus(order.id, mapped === 'approved' ? 'approved' : 'rejected')
      }
    }

    return NextResponse.json({ status: mapped })
  } catch (err) {
    console.error('[Nequi status]', err)
    return NextResponse.json({ status: 'pending' })
  }
}
