/**
 * Shopify — tipos públicos y helpers seguros para client + server.
 *
 * IMPORTANT:
 *   • Las funciones de FETCH al Admin API viven en `lib/shopify-server.ts`
 *     y están marcadas con `import 'server-only'` para que NUNCA terminen
 *     en un bundle del browser. Importa desde ahí en server components y
 *     route handlers.
 *   • Este archivo solo expone tipos, constantes públicas y `buildCartPermalink`,
 *     que es 100% client-safe (no toca tokens privados).
 *
 * Variables de entorno (.env.local):
 *   - NEXT_PUBLIC_SHOPIFY_DOMAIN              tu-tienda.myshopify.com  (PÚBLICO)
 *   - SHOPIFY_ADMIN_TOKEN                     shpat_...                (PRIVADO server)
 *   - NEXT_PUBLIC_SHOPIFY_PRODUCT_HANDLE      handle del producto principal
 *   - NEXT_PUBLIC_SHOPIFY_RELATED_COLLECTION_HANDLE  handle colección secundarios
 */

// ────────────────────────────────────────────────────────────────────
// Tipos públicos (consumidos por componentes de UI)
// ────────────────────────────────────────────────────────────────────

export interface ShopifyImage {
  url: string
  altText: string | null
  width: number | null
  height: number | null
}

export interface ShopifyMoney {
  amount: string
  currencyCode: string
}

export interface ShopifyVariant {
  id: string
  title: string
  availableForSale: boolean
  quantityAvailable: number | null
  price: ShopifyMoney
  compareAtPrice: ShopifyMoney | null
}

export interface ShopifyProduct {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  availableForSale: boolean
  totalInventory: number | null
  images: ShopifyImage[]
  variants: ShopifyVariant[]
  defaultVariant: ShopifyVariant | null
  priceRange: {
    min: ShopifyMoney
    max: ShopifyMoney
  }
}

// ────────────────────────────────────────────────────────────────────
// Constantes derivadas de env (públicas)
// ────────────────────────────────────────────────────────────────────

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN ?? ''

export const PRODUCT_HANDLE =
  process.env.NEXT_PUBLIC_SHOPIFY_PRODUCT_HANDLE ??
  'intercomunicador-jzaq-y10-kit-x2-para-moto'

export const RELATED_COLLECTION_HANDLE =
  process.env.NEXT_PUBLIC_SHOPIFY_RELATED_COLLECTION_HANDLE ?? 'related-products'

export function getShopifyDomain(): string {
  return SHOPIFY_DOMAIN
}

// ────────────────────────────────────────────────────────────────────
// Cart permalink — checkout sin token
// ────────────────────────────────────────────────────────────────────

/**
 * Convierte un GID de variante (gid://shopify/ProductVariant/123)
 * en el ID numérico que usa el cart permalink de Shopify.
 */
export function variantNumericId(gid: string): string {
  const match = gid.match(/(\d+)$/)
  return match?.[1] ?? gid
}

/**
 * URL del cart permalink de Shopify para checkout directo.
 *   https://{shop}/cart/{variantNumericId}:{qty}
 *
 * Esto pasa por el flujo nativo de Shopify (precio, envíos, descuentos,
 * inventario, todo). No necesita Storefront API ni Admin API ni token —
 * Shopify resuelve el cart en su servidor y redirige a su checkout.
 *
 * Si no hay dominio configurado, fallback a WhatsApp.
 */
export function buildCartPermalink(
  variantId: string,
  quantity: number = 1,
  domain: string = SHOPIFY_DOMAIN
): string {
  const qty = Math.max(1, Math.floor(quantity))
  if (!domain) {
    return (
      'https://wa.me/573215009685?text=' +
      encodeURIComponent(
        `Hola MSN Products 👋, quiero comprar ${qty} unidad${qty > 1 ? 'es' : ''} del Intercomunicador JZAQ Y10.`
      )
    )
  }
  const id = variantNumericId(variantId)
  return `https://${domain}/cart/${id}:${qty}`
}
