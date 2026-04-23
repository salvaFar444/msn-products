import { SITE } from '@/data/site'
import { sanitizeText, sanitizePhone } from './sanitize'
import { formatCOP } from './formatCurrency'
import type { AppliedDiscount } from '@/types'

export interface OrderCartItem {
  name: string
  price: number
  quantity: number
}

export interface OrderFormData {
  fullName: string
  city: string
  neighborhood: string
  address: string
  phone: string
}

export function normalizeCity(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function isMonteria(city: string): boolean {
  return normalizeCity(city) === 'monteria'
}

export function buildWhatsAppOrderUrl(
  items: OrderCartItem[],
  form: OrderFormData,
  discount?: AppliedDiscount | null
): string {
  const productLines = items
    .map((i) => {
      const safeName = sanitizeText(i.name)
      return `• ${safeName} x${i.quantity} — ${formatCOP(i.price)} c/u = ${formatCOP(
        i.price * i.quantity
      )}`
    })
    .join('\n')

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discountAmount = discount ? Math.min(discount.amount, subtotal) : 0
  const total = Math.max(0, subtotal - discountAmount)
  const inMonteria = isMonteria(form.city)

  const paymentLine = inMonteria
    ? '💵 Pago contra entrega (Montería).\n🚚 Domicilio gratis.'
    : '📦 Envío fuera de Montería: coordinemos método de envío y forma de pago por aquí.'

  const safeForm = {
    fullName: sanitizeText(form.fullName),
    city: sanitizeText(form.city),
    neighborhood: sanitizeText(form.neighborhood),
    address: sanitizeText(form.address),
    phone: sanitizePhone(form.phone),
  }

  let couponSection = ''
  let totalsSection = `💰 *TOTAL: ${formatCOP(total)}*`
  if (discount && discountAmount > 0) {
    const valueLabel =
      discount.discountType === 'percentage'
        ? `${discount.discountValue}%`
        : formatCOP(discount.discountValue)
    couponSection = `\n🏷️ *CUPÓN APLICADO:*\nCódigo: ${sanitizeText(discount.code)} (${valueLabel})\nDescuento: −${formatCOP(discountAmount)}\n`
    totalsSection = `🧾 Subtotal: ${formatCOP(subtotal)}\n💰 *TOTAL: ${formatCOP(total)}*`
  }

  const message = `Hola MSN Products 👋, quiero generar la siguiente orden:

🛍️ *PRODUCTOS:*
${productLines}
${couponSection}
${totalsSection}

📍 *DATOS DE ENVÍO:*
Nombre: ${safeForm.fullName}
Ciudad: ${safeForm.city}
Barrio: ${safeForm.neighborhood}
Dirección: ${safeForm.address}
Teléfono: ${safeForm.phone}

${paymentLine}
¡Gracias!`

  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`
}

export function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`
}
