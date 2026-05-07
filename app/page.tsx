import type { Metadata } from 'next'
import LandingClient from '@/components/landing/LandingClient'
import {
  fetchProduct,
  fetchRelatedProducts,
  getShopifyDomain,
  PRODUCT_HANDLE,
} from '@/lib/shopify'
import { SITE_NAME } from '@/lib/constants'

// Revalidación cada 60s — el contenido del producto en Shopify
// (precio, stock) cambia con frecuencia.
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const product = await fetchProduct(PRODUCT_HANDLE)
  const titleBase = product?.title ?? 'Intercomunicador JZAQ Y10'
  const title = `${titleBase} — Bluetooth para Moto | ${SITE_NAME}`
  const description =
    product?.description?.slice(0, 160) ??
    'Kit de 2 intercomunicadores Bluetooth 5.3 para moto. IP67, 42 h de batería, cancelación de ruido. Envío gratis en Montería. ¡Solo $129.900!'

  const ogImage = product?.images[0]?.url

  return {
    // 'absolute' evita que se le pegue el template "%s | MSN Products"
    // definido en layout.tsx.
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 1200, alt: titleBase }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

/**
 * Landing one-product. Hace fetch en el server del producto principal
 * y de los relacionados desde Shopify Admin API. El cliente
 * (LandingClient) maneja la cantidad y los CTAs de carrito.
 *
 * Si la tienda no tiene producto configurado, mostramos un fallback
 * mínimo en lugar de fallar. Mientras tanto el admin de Shopify es la
 * única fuente de verdad para precio, stock e imágenes.
 */
export default async function HomePage() {
  const [product, related] = await Promise.all([
    fetchProduct(PRODUCT_HANDLE),
    fetchRelatedProducts(8),
  ])

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink-strong">
          Estamos preparando esta tienda.
        </h1>
        <p className="mt-4 text-ink-light">
          Verifica que <code>NEXT_PUBLIC_SHOPIFY_DOMAIN</code> y{' '}
          <code>SHOPIFY_ADMIN_TOKEN</code> estén configurados en{' '}
          <code>.env.local</code> y que el producto con handle{' '}
          <code>{PRODUCT_HANDLE}</code> exista en Shopify.
        </p>
      </div>
    )
  }

  return (
    <LandingClient
      product={product}
      related={related}
      shopDomain={getShopifyDomain()}
    />
  )
}
