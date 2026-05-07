/**
 * Shopify Storefront API client.
 *
 * Reads credentials from env vars:
 *   - NEXT_PUBLIC_SHOPIFY_DOMAIN          → tu-tienda.myshopify.com
 *   - NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN → public Storefront API token
 *   - NEXT_PUBLIC_SHOPIFY_PRODUCT_HANDLE  → handle del producto principal (default: 'jzaq-y10')
 *   - NEXT_PUBLIC_SHOPIFY_RELATED_COLLECTION_HANDLE → colección de productos secundarios (default: 'related-products')
 *
 * Las funciones públicas:
 *   - fetchProduct(handle?)       → producto principal + variantes + imágenes
 *   - fetchRelatedProducts()      → colección de productos secundarios
 *   - createCart()                → crea carrito vacío y devuelve { id, checkoutUrl }
 *   - addToCart(cartId, variantId, quantity)
 *   - getCheckoutUrl(cartId)      → url nativa de Shopify para redirigir
 *
 * IMPORTANTE: Mientras no haya credenciales, las funciones devuelven un
 * fallback mock para que el sitio renderice durante el desarrollo.
 */

// ────────────────────────────────────────────────────────────────────
// Tipos públicos
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
  /** Default variant (first one) — used for the "buy now" flow when no selector is shown */
  defaultVariant: ShopifyVariant | null
  priceRange: {
    min: ShopifyMoney
    max: ShopifyMoney
  }
}

export interface ShopifyCart {
  id: string
  checkoutUrl: string
  totalQuantity: number
}

// ────────────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────────────

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN ?? ''
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? ''
const API_VERSION = '2024-10'

export const PRODUCT_HANDLE =
  process.env.NEXT_PUBLIC_SHOPIFY_PRODUCT_HANDLE ?? 'jzaq-y10'

export const RELATED_COLLECTION_HANDLE =
  process.env.NEXT_PUBLIC_SHOPIFY_RELATED_COLLECTION_HANDLE ?? 'related-products'

const API_URL = SHOPIFY_DOMAIN
  ? `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`
  : ''

const CART_STORAGE_KEY = 'msn-shopify-cart-id'

export function isShopifyConfigured(): boolean {
  return Boolean(SHOPIFY_DOMAIN && STOREFRONT_TOKEN)
}

// ────────────────────────────────────────────────────────────────────
// GraphQL primitive
// ────────────────────────────────────────────────────────────────────

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!isShopifyConfigured()) {
    throw new Error(
      'Shopify no está configurado. Define NEXT_PUBLIC_SHOPIFY_DOMAIN y NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN en tu .env.local'
    )
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    // Server-side: cache product reads, skip cache for cart mutations.
    // We pass the cache directive per-query if needed.
  })

  if (!res.ok) {
    throw new Error(`Shopify HTTP ${res.status}: ${res.statusText}`)
  }

  const json = (await res.json()) as GraphQLResponse<T>

  if (json.errors?.length) {
    throw new Error(
      `Shopify GraphQL: ${json.errors.map((e) => e.message).join(', ')}`
    )
  }

  if (!json.data) {
    throw new Error('Shopify GraphQL: respuesta vacía')
  }

  return json.data
}

// ────────────────────────────────────────────────────────────────────
// Mocks de fallback (solo cuando no hay credenciales todavía)
// ────────────────────────────────────────────────────────────────────

const MOCK_VARIANT: ShopifyVariant = {
  id: 'gid://shopify/ProductVariant/MOCK-1',
  title: 'Default',
  availableForSale: true,
  quantityAvailable: 25,
  price: { amount: '129900', currencyCode: 'COP' },
  compareAtPrice: { amount: '189900', currencyCode: 'COP' },
}

const MOCK_PRODUCT: ShopifyProduct = {
  id: 'gid://shopify/Product/MOCK-1',
  handle: PRODUCT_HANDLE,
  title: 'Intercomunicador JZAQ Y10 Bluetooth para moto',
  description:
    'Kit de 2 intercomunicadores Bluetooth 5.3 con cancelación de ruido dual, IP67, 42 horas de batería y luz RGB. Comunícate con tu copiloto o escucha tu GPS sin distracciones.',
  descriptionHtml:
    '<p>Kit de 2 intercomunicadores Bluetooth 5.3 con cancelación de ruido dual, IP67, 42 horas de batería y luz RGB.</p>',
  availableForSale: true,
  totalInventory: 25,
  images: [
    {
      url: 'https://cdn.shopify.com/s/files/1/0000/0000/files/y10-1.jpg',
      altText: 'Intercomunicador JZAQ Y10 — vista frontal',
      width: 1200,
      height: 1200,
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0000/0000/files/y10-2.jpg',
      altText: 'Intercomunicador JZAQ Y10 — luz RGB encendida',
      width: 1200,
      height: 1200,
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0000/0000/files/y10-3.jpg',
      altText: 'Intercomunicador JZAQ Y10 — kit completo',
      width: 1200,
      height: 1200,
    },
  ],
  variants: [MOCK_VARIANT],
  defaultVariant: MOCK_VARIANT,
  priceRange: {
    min: MOCK_VARIANT.price,
    max: MOCK_VARIANT.price,
  },
}

const MOCK_RELATED: ShopifyProduct[] = [
  {
    ...MOCK_PRODUCT,
    id: 'mock-2',
    handle: 'soporte-celular-moto',
    title: 'Soporte de celular para moto',
    images: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0000/0000/files/soporte.jpg',
        altText: 'Soporte de celular',
        width: 800,
        height: 800,
      },
    ],
    variants: [
      {
        ...MOCK_VARIANT,
        id: 'mock-variant-2',
        price: { amount: '49900', currencyCode: 'COP' },
        compareAtPrice: null,
      },
    ],
    defaultVariant: { ...MOCK_VARIANT, id: 'mock-variant-2' },
  },
  {
    ...MOCK_PRODUCT,
    id: 'mock-3',
    handle: 'cargador-usb-moto',
    title: 'Cargador USB para moto',
    images: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0000/0000/files/cargador.jpg',
        altText: 'Cargador USB',
        width: 800,
        height: 800,
      },
    ],
    variants: [
      {
        ...MOCK_VARIANT,
        id: 'mock-variant-3',
        price: { amount: '39900', currencyCode: 'COP' },
        compareAtPrice: null,
      },
    ],
    defaultVariant: { ...MOCK_VARIANT, id: 'mock-variant-3' },
  },
]

// ────────────────────────────────────────────────────────────────────
// Adaptadores GraphQL → tipos públicos
// ────────────────────────────────────────────────────────────────────

interface RawProduct {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  availableForSale: boolean
  totalInventory: number | null
  images: { edges: Array<{ node: ShopifyImage }> }
  variants: {
    edges: Array<{
      node: {
        id: string
        title: string
        availableForSale: boolean
        quantityAvailable: number | null
        price: ShopifyMoney
        compareAtPrice: ShopifyMoney | null
      }
    }>
  }
  priceRange: {
    minVariantPrice: ShopifyMoney
    maxVariantPrice: ShopifyMoney
  }
}

function normaliseProduct(raw: RawProduct): ShopifyProduct {
  const variants: ShopifyVariant[] = raw.variants.edges.map((e) => e.node)
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    availableForSale: raw.availableForSale,
    totalInventory: raw.totalInventory,
    images: raw.images.edges.map((e) => e.node),
    variants,
    defaultVariant: variants[0] ?? null,
    priceRange: {
      min: raw.priceRange.minVariantPrice,
      max: raw.priceRange.maxVariantPrice,
    },
  }
}

// ────────────────────────────────────────────────────────────────────
// Queries
// ────────────────────────────────────────────────────────────────────

const PRODUCT_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      availableForSale
      totalInventory
      images(first: 12) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 25) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`

const COLLECTION_QUERY = /* GraphQL */ `
  query CollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            id
            handle
            title
            description
            descriptionHtml
            availableForSale
            totalInventory
            images(first: 4) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`

const ALL_PRODUCTS_QUERY = /* GraphQL */ `
  query AllProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          descriptionHtml
          availableForSale
          totalInventory
          images(first: 4) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                title
                availableForSale
                quantityAvailable
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`

const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate {
    cartCreate {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        message
      }
    }
  }
`

const CART_ADD_LINES_MUTATION = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        message
      }
    }
  }
`

const CART_QUERY = /* GraphQL */ `
  query Cart($id: ID!) {
    cart(id: $id) {
      id
      checkoutUrl
      totalQuantity
    }
  }
`

// ────────────────────────────────────────────────────────────────────
// API pública
// ────────────────────────────────────────────────────────────────────

/**
 * Obtiene el producto principal por handle.
 * Fallback a un mock si Shopify aún no está configurado.
 */
export async function fetchProduct(
  handle: string = PRODUCT_HANDLE
): Promise<ShopifyProduct> {
  if (!isShopifyConfigured()) {
    return MOCK_PRODUCT
  }
  try {
    const data = await shopifyFetch<{ product: RawProduct | null }>(
      PRODUCT_QUERY,
      { handle }
    )
    if (!data.product) {
      console.warn(`[shopify] Producto '${handle}' no existe — usando mock.`)
      return MOCK_PRODUCT
    }
    return normaliseProduct(data.product)
  } catch (err) {
    console.error('[shopify.fetchProduct]', err)
    return MOCK_PRODUCT
  }
}

/**
 * Obtiene los productos secundarios desde la colección configurada.
 * Si la colección no existe, hace fallback a los últimos N productos.
 */
export async function fetchRelatedProducts(
  limit: number = 8
): Promise<ShopifyProduct[]> {
  if (!isShopifyConfigured()) {
    return MOCK_RELATED
  }
  try {
    const data = await shopifyFetch<{
      collection: { products: { edges: Array<{ node: RawProduct }> } } | null
    }>(COLLECTION_QUERY, {
      handle: RELATED_COLLECTION_HANDLE,
      first: limit,
    })
    if (data.collection) {
      return data.collection.products.edges.map((e) => normaliseProduct(e.node))
    }
    // Fallback: últimos productos de la tienda excluyendo el principal.
    const all = await shopifyFetch<{
      products: { edges: Array<{ node: RawProduct }> }
    }>(ALL_PRODUCTS_QUERY, { first: limit + 1 })
    return all.products.edges
      .map((e) => normaliseProduct(e.node))
      .filter((p) => p.handle !== PRODUCT_HANDLE)
      .slice(0, limit)
  } catch (err) {
    console.error('[shopify.fetchRelatedProducts]', err)
    return MOCK_RELATED
  }
}

/**
 * Crea un carrito nuevo. Devuelve el cartId y la URL de checkout.
 */
export async function createCart(): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartCreate: {
      cart: ShopifyCart | null
      userErrors: Array<{ message: string }>
    }
  }>(CART_CREATE_MUTATION)

  if (data.cartCreate.userErrors.length || !data.cartCreate.cart) {
    throw new Error(
      `No se pudo crear el carrito: ${data.cartCreate.userErrors
        .map((e) => e.message)
        .join(', ')}`
    )
  }

  return data.cartCreate.cart
}

/**
 * Agrega una variante al carrito. Devuelve el carrito actualizado.
 */
export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartLinesAdd: {
      cart: ShopifyCart | null
      userErrors: Array<{ message: string }>
    }
  }>(CART_ADD_LINES_MUTATION, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  })

  if (data.cartLinesAdd.userErrors.length || !data.cartLinesAdd.cart) {
    throw new Error(
      `No se pudo agregar al carrito: ${data.cartLinesAdd.userErrors
        .map((e) => e.message)
        .join(', ')}`
    )
  }

  return data.cartLinesAdd.cart
}

/**
 * Carga la URL de checkout del carrito actual (sirve como sanity check).
 */
export async function getCheckoutUrl(cartId: string): Promise<string> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>(CART_QUERY, {
    id: cartId,
  })
  if (!data.cart) {
    throw new Error('Carrito no encontrado en Shopify.')
  }
  return data.cart.checkoutUrl
}

// ────────────────────────────────────────────────────────────────────
// Helpers cliente — manejan localStorage y mocks
// ────────────────────────────────────────────────────────────────────

/**
 * Devuelve el cartId guardado en localStorage, o crea uno nuevo en Shopify.
 * Solo debe usarse en componentes 'use client'.
 */
export async function getOrCreateCart(): Promise<ShopifyCart> {
  if (typeof window === 'undefined') {
    throw new Error('getOrCreateCart solo debe llamarse en el cliente.')
  }

  if (!isShopifyConfigured()) {
    // Mock: simulamos un checkout que apunta al WhatsApp como fallback,
    // así el botón sigue funcionando en preview sin credenciales.
    const fallback: ShopifyCart = {
      id: 'mock-cart',
      checkoutUrl:
        'https://wa.me/573215009685?text=' +
        encodeURIComponent(
          'Hola MSN Products 👋, quiero comprar el Intercomunicador JZAQ Y10.'
        ),
      totalQuantity: 0,
    }
    return fallback
  }

  const stored = localStorage.getItem(CART_STORAGE_KEY)
  if (stored) {
    try {
      const url = await getCheckoutUrl(stored)
      return { id: stored, checkoutUrl: url, totalQuantity: 0 }
    } catch {
      // El carrito pudo expirar — caemos a crear uno nuevo.
      localStorage.removeItem(CART_STORAGE_KEY)
    }
  }

  const cart = await createCart()
  localStorage.setItem(CART_STORAGE_KEY, cart.id)
  return cart
}

/**
 * Flujo "Comprar ahora" — agrega y redirige al checkout de Shopify.
 * Si Shopify no está configurado, abre WhatsApp con un mensaje pre-armado.
 */
export async function buyNow(
  variantId: string,
  quantity: number = 1
): Promise<string> {
  const cart = await getOrCreateCart()
  if (!isShopifyConfigured()) {
    return cart.checkoutUrl
  }
  const updated = await addToCart(cart.id, variantId, quantity)
  return updated.checkoutUrl
}
