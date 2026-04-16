/**
 * SITE — Centralized business information.
 * Every component should read from here instead of hardcoding values.
 * The only contact channels are WhatsApp and Instagram. NO email.
 */
export const SITE = {
  name: 'MSN Products',
  tagline: 'Accesorios tecnológicos con domicilio gratis en Montería',
  city: 'Montería',
  department: 'Córdoba',
  country: 'Colombia',

  // WhatsApp
  whatsappNumber: '573215009685', // sin +, sin espacios
  whatsappDisplay: '+57 321 500 9685',

  // Instagram
  instagram: 'msnproducts',
  instagramUrl: 'https://www.instagram.com/msnproducts',

  // Commercial
  warrantyMonths: 3,
  freeDeliveryCity: 'Montería',
  paymentMethod: 'Pago contra entrega',

  // Placeholder — update with real customer count when available
  happyCustomersLabel: '+100 clientes',

  // Site URL
  siteUrl: 'https://msn-products.vercel.app',
} as const

/**
 * Default WhatsApp URL — opens WhatsApp with a simple greeting.
 * For order flows, use `buildWhatsAppOrderUrl` from `@/lib/whatsapp`.
 */
export const WHATSAPP_URL = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  'Hola MSN Products 👋, tengo una pregunta sobre sus productos.'
)}`
