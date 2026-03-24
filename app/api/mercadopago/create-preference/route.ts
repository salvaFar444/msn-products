import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/orders'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, customer, total, nequiDefault } = body

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json({ mode: 'simulation' })
    }

    // Dynamic import to avoid issues if package not installed
    const { MercadoPagoConfig, Preference } = await import('mercadopago')
    const client = new MercadoPagoConfig({ accessToken })

    const mpItems = (items as Array<{ name: string; price: number; quantity: number }>).map(
      (item) => ({
        id: item.name,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price / 100, // assuming price is in cents (COP)
        currency_id: 'COP',
      })
    )

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prefBody: any = {
      items: mpItems,
      payer: customer
        ? {
            name: customer.firstName,
            surname: customer.lastName,
            email: customer.email,
            phone: { number: customer.phone },
          }
        : undefined,
      back_urls: {
        success: `${baseUrl}/checkout/success`,
        failure: `${baseUrl}/checkout`,
        pending: `${baseUrl}/checkout`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
    }

    if (nequiDefault) {
      prefBody.payment_methods = { default_payment_method_id: 'nequi' }
    }

    const preference = await new Preference(client).create({ body: prefBody })

    // Persist pending order
    await createOrder({
      mp_preference_id: preference.id ?? null,
      mp_payment_id: null,
      status: 'pending',
      items: items,
      customer: customer ?? {},
      total,
    })

    return NextResponse.json({
      mode: 'live',
      init_point: preference.init_point,
      preference_id: preference.id,
    })
  } catch (err) {
    console.error('[MP create-preference]', err)
    return NextResponse.json({ mode: 'simulation' })
  }
}
