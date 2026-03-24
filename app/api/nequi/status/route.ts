import { NextRequest, NextResponse } from 'next/server'
import { getOrderByPreferenceId, updateOrderStatus } from '@/lib/orders'
import { getNequiToken, hasNequiCredentials, NEQUI_API_URL } from '@/lib/nequi'
import { reduceStockForItems } from '@/lib/stock'
import type { OrderItem } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ status: 'failed' }, { status: 400 })
    }

    if (!hasNequiCredentials()) {
      return NextResponse.json({ status: 'failed' })
    }

    const token = await getNequiToken()

    const statusRes = await fetch(
      `${NEQUI_API_URL}/payments/gateway/push/${encodeURIComponent(id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

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

    if (mapped === 'approved' || mapped === 'failed') {
      const order = await getOrderByPreferenceId(id)
      if (order) {
        const wasAlreadyApproved = order.status === 'approved'

        await updateOrderStatus(
          order.id,
          mapped === 'approved' ? 'approved' : 'rejected'
        )

        // Reduce stock once on approval
        if (mapped === 'approved' && !wasAlreadyApproved) {
          await reduceStockForItems(order.items as OrderItem[])
        }
      }
    }

    return NextResponse.json({ status: mapped })
  } catch (err) {
    console.error('[Nequi status]', err)
    return NextResponse.json({ status: 'pending' })
  }
}
