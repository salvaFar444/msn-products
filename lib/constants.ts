export const SITE_NAME = 'MSN Products'
export const SITE_DESCRIPTION =
  'Compra Apple Watch, AirPods y accesorios tech originales en Colombia. Envío rápido, garantía incluida.'
export const SITE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

// WhatsApp — reads from env, falls back to placeholder
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573215009685'

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Hola MSN Products, quiero hacer un pedido 🛍️'
)}`

export const WHATSAPP_CHECKOUT_URL = (orderDetails: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola MSN Products, acabo de realizar un pedido:\n\n${orderDetails}\n\n¿Podrían confirmar la disponibilidad?`
  )}`

// Supabase Storage
export const SUPABASE_BUCKET = 'product-images'
export const MAX_IMAGE_SIZE_MB = 5
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Cart
export const CART_STORAGE_KEY = 'msn-cart-storage'

// ISR revalidation
export const PRODUCTS_REVALIDATE_SECONDS = 60

// Colombian departments for checkout
export const COLOMBIAN_DEPARTMENTS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
  'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
  'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
  'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
  'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupés', 'Vichada', 'Bogotá D.C.',
]
