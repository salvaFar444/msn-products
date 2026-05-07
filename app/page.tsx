import type { Metadata } from 'next'
import LandingClient from '@/components/landing/LandingClient'
import { fetchProduct, fetchRelatedProducts, PRODUCT_HANDLE } from '@/lib/shopify'
import { SITE_NAME } from '@/lib/constants'

// Revalidación cada 60s — el contenido del producto en Shopify
// (precio, stock) cambia con frecuencia.
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const product = await fetchProduct(PRODUCT_HANDLE)
  const title = `${product.title} — Bluetooth para Moto | ${SITE_NAME}`
  const description =
    'Kit de 2 intercomunicadores Bluetooth 5.3 para moto. IP67, 42 h de batería, cancelación de ruido. Envío gratis en Montería. ¡Solo $129.900!'

  const ogImage = product.images[0]?.url

  return {
    // 'absolute' evita que se le pegue el template "%s | MSN Products"
    // definido en layout.tsx (sino quedaría duplicado el sufijo).
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 1200, alt: product.title }] : undefined,
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
 * y de los relacionados desde Shopify Storefront API. El cliente
 * (LandingClient) maneja la cantidad y los CTAs de carrito.
 */
export default async function HomePage() {
  const [product, related] = await Promise.all([
    fetchProduct(PRODUCT_HANDLE),
    fetchRelatedProducts(8),
  ])

  return <LandingClient product={product} related={related} />
}
