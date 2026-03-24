/**
 * POST /api/mercadopago/create-preference
 *
 * Creates a MercadoPago Checkout Pro preference and persists a pending order
 * in Supabase. Nequi and PSE are surfaced as highlighted options inside the
 * MP checkout — no separate Nequi API calls are needed.
 *
 * Env vars required:
 *   MP_ACCESS_TOKEN       — production or sandbox access token
 *   NEXT_PUBLIC_BASE_URL  — origin URL (e.g. https://msnproducts.vercel.app)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/orders'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, customer, total } = body

    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      // No credentials → tell the client to use simulation fallback
      return NextResponse.json({ mode: 'simulation' })
    }

    const { MercadoPagoConfig, Preference } = await import('mercadopago')
    const client = new MercadoPagoConfig({ accessToken })

    // ── Build line items ─────────────────────────────────────────────
    const mpItems = (
      items as Array<{ productId: string; name: string; price: number; quantity: number }>
    ).map((item) => ({
      id: item.productId,
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,   // price is already in COP integer (no cents)
      currency_id: 'COP',
    }))

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000'

    // ── Preference body ──────────────────────────────────────────────
    const preference = await new Preference(client).create({
      body: {
        items: mpItems,

        // Pre-fill payer info so MP shows it in checkout
        payer: customer
          ? {
              name: customer.firstName,
              surname: customer.lastName,
              email: customer.email,
              phone: { area_code: '57', number: customer.phone?.replace(/\D/g, '') },
            }
          : undefined,

        // Back URLs — MP appends ?payment_id=...&status=...&preference_id=...
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout?error=failure`,
          pending: `${baseUrl}/checkout/success`,   // pending also shows confirmation
        },
        auto_return: 'approved',

        // Webhook for server-side confirmation (stock reduction, order update)
        notification_url: `${baseUrl}/api/mercadopago/webhook`,

        // ── Highlight Nequi and PSE inside the MP checkout UI ────────
        payment_methods: {
          // Exclude cards to make Nequi/PSE more prominent, or leave empty for all methods
          // Uncomment the line below to show ONLY Nequi + PSE:
          // excluded_payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }],
          default_payment_method_id: 'nequi',   // pre-selects Nequi tab
          installments: 1,                        // no installments for accessories
        },
      },
    })

    // ── Persist pending order ────────────────────────────────────────
    await createOrder({
      mp_preference_id: preference.id ?? null,
      mp_payment_id: null,
      status: 'pending',
      items,
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
