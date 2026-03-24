/**
 * POST /api/mercadopago/create-preference
 *
 * Crea una preferencia de MercadoPago Checkout Pro (producción).
 * Siempre usa init_point (nunca sandbox_init_point).
 * El payer se omite si el cliente no ingresó datos — MP los pide
 * en su propia interfaz, evitando conflictos con cuentas de prueba.
 *
 * Env vars requeridas:
 *   MP_ACCESS_TOKEN       — token de producción (APP_USR-...)
 *   NEXT_PUBLIC_BASE_URL  — dominio público (https://tuapp.vercel.app)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/orders'

export async function POST(req: NextRequest) {
  const accessToken =
    process.env.MP_ACCESS_TOKEN ||
    process.env.MERCADOPAGO_ACCESS_TOKEN

  if (!accessToken) {
    console.warn('[MP] Token no encontrado. Configura MP_ACCESS_TOKEN en las variables de entorno.')
    return NextResponse.json({ mode: 'no_token', error: 'Token de MercadoPago no configurado.' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const { items, customer, total } = body

    const { MercadoPagoConfig, Preference } = await import('mercadopago')
    const client = new MercadoPagoConfig({ accessToken })

    // ── Items: unit_price debe ser entero en COP (sin decimales) ────
    const mpItems = (
      items as Array<{ productId: string; name: string; price: number; quantity: number }>
    ).map((item) => ({
      id: item.productId,
      title: item.name,
      quantity: Number(item.quantity),
      unit_price: Math.round(Number(item.price)),
      currency_id: 'COP',
    }))

    // ── baseUrl siempre HTTPS en Vercel ─────────────────────────────
    // NEXT_PUBLIC_BASE_URL en Vercel debe ser https://tuapp.vercel.app
    const baseUrl = (
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000'
    )

    // ── Payer: solo se envía si el cliente llenó el formulario ───────
    // NO uses emails de prueba (test_user...) — MP los detecta y bloquea
    // el pago real. Si el email falta, MP lo solicita en su propia UI.
    const hasPayer = customer?.email && !customer.email.includes('testuser')
    const payer = hasPayer
      ? {
          name: customer.firstName || undefined,
          surname: customer.lastName || undefined,
          email: customer.email,
          phone: customer.phone
            ? { area_code: '57', number: customer.phone.replace(/\D/g, '') }
            : undefined,
        }
      : undefined

    const preference = await new Preference(client).create({
      body: {
        items: mpItems,
        ...(payer ? { payer } : {}),
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout?error=failure`,
          pending: `${baseUrl}/checkout/success`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        payment_methods: {
          installments: 1,
        },
      },
    })

    console.log('[MP] Preferencia creada:', preference.id, '| init_point:', preference.init_point?.slice(0, 60))

    // init_point = producción | sandbox_init_point = pruebas
    // Con token APP_USR-, init_point siempre existe.
    if (!preference.init_point) {
      return NextResponse.json({
        mode: 'error',
        error: 'MercadoPago no devolvió el enlace de pago. Verifica que el token sea de producción (APP_USR-...).',
      }, { status: 502 })
    }

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
      init_point: preference.init_point,  // siempre producción
      preference_id: preference.id,
    })
  } catch (err) {
    let detail: string
    try {
      detail = JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
    } catch {
      detail = String(err)
    }
    console.error('[MP Error Detallado]:', detail)

    const readable =
      (err as { message?: string })?.message ||
      (err as { error?: string })?.error ||
      detail

    return NextResponse.json({ mode: 'error', error: readable, detail }, { status: 500 })
  }
}
