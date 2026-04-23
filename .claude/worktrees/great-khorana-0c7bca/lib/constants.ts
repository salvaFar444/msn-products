import { SITE } from '@/data/site'

export const SITE_NAME = SITE.name
export const SITE_DESCRIPTION = `Accesorios tecnológicos en ${SITE.city}. Domicilio gratis, pago contra entrega y garantía de ${SITE.warrantyMonths} meses. Haz tu pedido por WhatsApp.`
export const SITE_URL = process.env.NEXTAUTH_URL ?? SITE.siteUrl

// Re-exported from data/site for backward compatibility
export { WHATSAPP_URL } from '@/data/site'

// Supabase Storage
export const SUPABASE_BUCKET = 'product-images'
export const SUPABASE_VIDEO_BUCKET = 'product-videos'
export const MAX_IMAGE_SIZE_MB = 5
export const MAX_VIDEO_SIZE_MB = 20
export const MAX_MEDIA_PER_PRODUCT = 10
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

// Cart
export const CART_STORAGE_KEY = 'msn-cart-storage'

// ISR revalidation
export const PRODUCTS_REVALIDATE_SECONDS = 60

// Rate limit — OrderForm submissions per session
export const ORDER_SUBMISSION_MAX = 3
export const ORDER_SUBMISSION_WINDOW_MS = 10 * 60 * 1000 // 10 min
