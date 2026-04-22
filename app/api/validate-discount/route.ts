import { NextResponse } from 'next/server'
import { validateDiscountCode } from '@/lib/discounts'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const code = typeof body?.code === 'string' ? body.code : ''
    const subtotal = Number(body?.subtotal)

    if (!code || !Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json(
        { ok: false, error: 'Solicitud inválida.' },
        { status: 400 }
      )
    }

    const result = await validateDiscountCode(code, subtotal)
    return NextResponse.json(result, { status: result.ok ? 200 : 200 })
  } catch (err) {
    console.error('[POST /api/validate-discount]', err)
    return NextResponse.json(
      { ok: false, error: 'Error interno.' },
      { status: 500 }
    )
  }
}
