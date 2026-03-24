/**
 * POST /api/mercadopago/create-preference
 *
 * Env vars (acepta ambos nombres por compatibilidad):
 *   MP_ACCESS_TOKEN  ó  MERCADOPAGO_ACCESS_TOKEN
 *   NEXT_PUBLIC_BASE_URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/orders'

export async function POST(req: NextRequest) {
  // ── Check de variables — acepta ambos nombres ────────────────────
  const accessToken =
    process.env.MP_ACCESS_TOKEN ||
    process.env.MERCADOPAGO_ACCESS_TOKEN

  // Log de diagnóstico (visible en terminal de VS Code / Vercel logs)
  console.log('[MP] accessToken encontrado:', accessToken ? `${accessToken.slice(0, 12)}...` : 'NO ENCONTRADO')

  if (!accessToken) {
    console.warn('[MP] No se encontró MP_ACCESS_TOKEN ni MERCADOPAGO_ACCESS_TOKEN en .env.local')
    return NextResponse.json({ mode: 'simulation', error: 'Token no configurado' })
  }

  try {
    const body = await req.json()
    const { items, customer, total } = body

    // Log de diagnóstico — items recibidos
    console.log('[MP] Items recibidos:', JSON.stringify(items, null, 2))

    const { MercadoPagoConfig, Preference } = await import('mercadopago')
    const client = new MercadoPagoConfig({ accessToken })

    // ── Validación de unit_price — convierte a entero limpio ─────────
    // MP rechaza decimales (65.000 con punto) y strings
    const mpItems = (
      items as Array<{ productId: string; name: string; price: number; quantity: number }>
    ).map((item) => {
      const unitPrice = Math.round(Number(String(item.price).replace(/\./g, '').replace(',', '.')))
      console.log(`[MP] item "${item.name}" → unit_price: ${unitPrice} (original: ${item.price})`)
      return {
        id: item.productId,
        title: item.name,
        quantity: Number(item.quantity),
        unit_price: unitPrice,
        currency_id: 'COP',
      }
    })

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000'

    console.log('[MP] baseUrl para back_urls:', baseUrl)

    // ── Crear preferencia ────────────────────────────────────────────
    const preference = await new Preference(client).create({
      body: {
        items: mpItems,
        // MP exige un email válido en el payer — usa fallback si el usuario no lo envió
        payer: {
          name: customer?.firstName || 'Cliente',
          surname: customer?.lastName || 'MSN',
          email: customer?.email || 'test_user_123456@testuser.com',
          phone: { area_code: '57', number: (customer?.phone || '').replace(/\D/g, '') },
        },
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout?error=failure`,
          pending: `${baseUrl}/checkout/success`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        // Sin restricciones — MP muestra todos los métodos disponibles en la cuenta
        payment_methods: {
          installments: 1,
        },
      },
    })

    // ── Log de respuesta completa de MP ──────────────────────────────
    console.log('Respuesta MP:', JSON.stringify({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    }, null, 2))

    if (!preference.init_point) {
      console.error('[MP] Preferencia creada pero sin init_point:', preference)
      return NextResponse.json({
        mode: 'error',
        error: 'MercadoPago no devolvió el link de pago. Revisa que el token sea de PRODUCCIÓN (APP_USR-...) y no de sandbox.',
      })
    }

    // ── Persistir orden pendiente ────────────────────────────────────
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
    // El SDK de MP lanza objetos propios, no instancias de Error estándar.
    // JSON.stringify expone el cuerpo completo: status, cause[], message anidado.
    let detail: string
    try {
      detail = JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
    } catch {
      detail = String(err)
    }

    console.error('[MP Error Detallado]:', detail)

    // Extraer mensaje legible para devolver al frontend
    const readable =
      (err as { message?: string })?.message ||
      (err as { error?: string })?.error ||
      detail

    return NextResponse.json({
      mode: 'error',
      error: readable,
      detail,  // el frontend puede mostrarlo en el alert para diagnóstico
    })
  }
}
