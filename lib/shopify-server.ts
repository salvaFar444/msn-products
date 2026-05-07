import 'server-only'
import type { ShopifyImage, ShopifyMoney, ShopifyProduct, ShopifyVariant } from './shopify'
import { PRODUCT_HANDLE, RELATED_COLLECTION_HANDLE } from './shopify'

/**
 * Fetcher server-only contra el Admin GraphQL API de Shopify.
 *
 * Importa `server-only` para que el bundler de Next.js falle el build
 * si alguien intenta importar este módulo desde un componente cliente.
 * Así garantizamos que SHOPIFY_ADMIN_TOKEN nunca termine en el bundle
 * del browser.
 */

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN ?? ''
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN ?? ''
const ADMIN_API_VERSION = '2024-10'

const ADMIN_API_URL = SHOPIFY_DOMAIN
  ? `https://${SHOPIFY_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`
  : ''

function isAdminConfigured(): boolean {
  return Boolean(SHOPIFY_DOMAIN && ADMIN_TOKEN)
}

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

async function adminFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!isAdminConfigured()) {
    throw new Error(
      'Shopify no está configurado. Define NEXT_PUBLIC_SHOPIFY_DOMAIN y SHOPIFY_ADMIN_TOKEN en .env.local'
    )
  }
  const res = await fetch(ADMIN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN,
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Shopify HTTP ${res.status}: ${text || res.statusText}`)
  }

  const json = (await res.json()) as GraphQLResponse<T>

  if (json.errors?.length) {
    throw new Error(
      `Shopify GraphQL: ${json.errors.map((e) => e.message).join(', ')}`
    )
  }
  if (!json.data) throw new Error('Shopify GraphQL: respuesta vacía')
  return json.data
}

// ────────────────────────────────────────────────────────────────────
// Tipos GraphQL crudos del Admin API
// ────────────────────────────────────────────────────────────────────

interface AdminProductRaw {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  status: string
  totalInventory: number | null
  images: { edges: Array<{ node: ShopifyImage }> }
  variants: {
    edges: Array<{
      node: {
        id: string
        title: string
        availableForSale: boolean
        inventoryQuantity: number | null
        price: string
        compareAtPrice: string | null
      }
    }>
  }
  priceRangeV2: {
    minVariantPrice: ShopifyMoney
    maxVariantPrice: ShopifyMoney
  }
}

function normaliseVariant(
  raw: AdminProductRaw['variants']['edges'][number]['node'],
  currency: string
): ShopifyVariant {
  return {
    id: raw.id,
    title: raw.title,
    availableForSale: raw.availableForSale,
    quantityAvailable: raw.inventoryQuantity,
    price: { amount: raw.price, currencyCode: currency },
    compareAtPrice: raw.compareAtPrice
      ? { amount: raw.compareAtPrice, currencyCode: currency }
      : null,
  }
}

function normaliseProduct(raw: AdminProductRaw): ShopifyProduct {
  const currency = raw.priceRangeV2.minVariantPrice.currencyCode
  const variants = raw.variants.edges.map((e) => normaliseVariant(e.node, currency))
  const anyAvailable = variants.some((v) => v.availableForSale)
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    availableForSale: anyAvailable,
    totalInventory: raw.totalInventory,
    images: raw.images.edges.map((e) => e.node),
    variants,
    defaultVariant: variants[0] ?? null,
    priceRange: {
      min: raw.priceRangeV2.minVariantPrice,
      max: raw.priceRangeV2.maxVariantPrice,
    },
  }
}

// ────────────────────────────────────────────────────────────────────
// Queries
// ────────────────────────────────────────────────────────────────────

const ADMIN_PRODUCT_FIELDS = /* GraphQL */ `
  id
  handle
  title
  description
  descriptionHtml
  status
  totalInventory
  images(first: 12) {
    edges {
      node { url altText width height }
    }
  }
  variants(first: 25) {
    edges {
      node {
        id
        title
        availableForSale
        inventoryQuantity
        price
        compareAtPrice
      }
    }
  }
  priceRangeV2 {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
`

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      ${ADMIN_PRODUCT_FIELDS}
    }
  }
`

const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          ${ADMIN_PRODUCT_FIELDS}
        }
      }
    }
  }
`

const COLLECTION_QUERY = /* GraphQL */ `
  query Collections($query: String!) {
    collections(first: 1, query: $query) {
      edges {
        node {
          id
          handle
          products(first: 12) {
            edges {
              node {
                ${ADMIN_PRODUCT_FIELDS}
              }
            }
          }
        }
      }
    }
  }
`

// ────────────────────────────────────────────────────────────────────
// API pública (server-only)
// ────────────────────────────────────────────────────────────────────

export async function fetchProduct(
  handle: string = PRODUCT_HANDLE
): Promise<ShopifyProduct | null> {
  if (!isAdminConfigured()) {
    console.warn('[shopify] No configurado — devolviendo null')
    return null
  }
  try {
    const data = await adminFetch<{ productByHandle: AdminProductRaw | null }>(
      PRODUCT_BY_HANDLE_QUERY,
      { handle }
    )
    if (!data.productByHandle) {
      console.warn(`[shopify] Producto '${handle}' no existe en la tienda.`)
      return null
    }
    return normaliseProduct(data.productByHandle)
  } catch (err) {
    console.error('[shopify.fetchProduct]', err)
    return null
  }
}

export async function fetchRelatedProducts(
  limit: number = 8
): Promise<ShopifyProduct[]> {
  if (!isAdminConfigured()) return []
  try {
    const collData = await adminFetch<{
      collections: {
        edges: Array<{
          node: {
            id: string
            handle: string
            products: { edges: Array<{ node: AdminProductRaw }> }
          }
        }>
      }
    }>(COLLECTION_QUERY, { query: `handle:${RELATED_COLLECTION_HANDLE}` })

    const coll = collData.collections.edges[0]?.node
    if (coll && coll.products.edges.length > 0) {
      return coll.products.edges.map((e) => normaliseProduct(e.node)).slice(0, limit)
    }

    const all = await adminFetch<{
      products: { edges: Array<{ node: AdminProductRaw }> }
    }>(PRODUCTS_QUERY, {
      first: limit + 1,
      query: 'status:active',
    })
    return all.products.edges
      .map((e) => normaliseProduct(e.node))
      .filter((p) => p.handle !== PRODUCT_HANDLE)
      .slice(0, limit)
  } catch (err) {
    console.error('[shopify.fetchRelatedProducts]', err)
    return []
  }
}
