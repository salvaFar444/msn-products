import { SITE } from '@/data/site'
import { sanitizeText, sanitizePhone } from './sanitize'
import { formatCOP } from './formatCurrency'

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

/** Normalize a string for comparison — lowercase, no accents, trimmed. */
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

/**
 * Builds a WhatsApp URL with a pre-filled order message.
 * Message content adapts based on whether the delivery city is Montería:
 *  - Montería  → promises free delivery + cash on delivery
 *  - Otherwise → asks to coordinate shipping & payment over WhatsApp
 */
export function buildWhatsAppOrderUrl(
  items: OrderCartItem[],
  form: OrderFormData
): string {
  // Build product lines
  const productLines = items
    .map((i) => {
      const safeName = sanitizeText(i.name)
      return `• ${safeName} x${i.quantity} — ${formatCOP(i.price)} c/u = ${formatCOP(
        i.price * i.quantity
      )}`
    })
    .join('\n')

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const inMonteria = isMonteria(form.city)

  // Closing line varies by city
  const paymentLine = inMonteria
    ? '💵 Pago contra entrega (Montería).\n🚚 Domicilio gratis.'
    : '📦 Envío fuera de Montería: coordinemos método de envío y forma de pago por aquí.'

  // Sanitize every field before using it
  const safeForm = {
    fullName: sanitizeText(form.fullName),
    city: sanitizeText(form.city),
    neighborhood: sanitizeText(form.neighborhood),
    address: sanitizeText(form.address),
    phone: sanitizePhone(form.phone),
  }

  const message = `Hola MSN Products 👋, quiero generar la siguiente orden:

🛍️ *PRODUCTOS:*
${productLines}

💰 *TOTAL: ${formatCOP(total)}*

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

/** Simple WhatsApp URL with custom text. */
export function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`
}
