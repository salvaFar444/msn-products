import type { Metadata } from 'next'
import LandingClient from '@/components/landing/LandingClient'
import {
  getShopifyDomain,
  PRODUCT_HANDLE,
} from '@/lib/shopify'
import { fetchProduct, fetchRelatedProducts } from '@/lib/shopify-server'
import { SITE_NAME } from '@/lib/constants'

// Revalidación cada 60s — el contenido del producto en Shopify
// (precio, stock) cambia con frecuencia.
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const result = await fetchProduct(PRODUCT_HANDLE)
  const product = result.ok ? result.product : null
  const titleBase = product?.title ?? 'Intercomunicador JZAQ Y10'
  const title = `${titleBase} — Bluetooth para Moto | ${SITE_NAME}`
  const description =
    product?.description?.slice(0, 160) ??
    'Kit de 2 intercomunicadores Bluetooth 5.3 para moto. IP67, 42 h de batería, cancelación de ruido. Envío gratis en Montería. ¡Solo $129.900!'

  const ogImage = product?.images[0]?.url

  return {
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
 * Landing one-product. Hace fetch del producto principal y de los
 * relacionados en el server. Si Shopify no responde, mostramos un
 * mensaje accionable con el motivo exacto del fallo.
 */
export default async function HomePage() {
  const [productResult, related] = await Promise.all([
    fetchProduct(PRODUCT_HANDLE),
    fetchRelatedProducts(8),
  ])

  if (!productResult.ok) {
    return <ConfigDiagnostic reason={productResult.reason} error={productResult.error} />
  }

  return (
    <LandingClient
      product={productResult.product}
      related={related}
      shopDomain={getShopifyDomain()}
    />
  )
}

// ────────────────────────────────────────────────────────────────────
// Diagnóstico — solo se muestra cuando la API de Shopify no responde.
// ────────────────────────────────────────────────────────────────────

function ConfigDiagnostic({
  reason,
  error,
}: {
  reason: 'missing-env' | 'not-found' | 'fetch-error'
  error?: string
}) {
  const hasDomain = Boolean(process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN)
  const hasToken = Boolean(process.env.SHOPIFY_ADMIN_TOKEN)

  let title = 'Estamos preparando esta tienda.'
  let description = 'En unos minutos volvemos.'
  let helpItems: string[] = []

  if (reason === 'missing-env') {
    title = 'Faltan credenciales de Shopify'
    description = 'No pude conectar con tu tienda porque las variables de entorno no están cargadas.'
    helpItems = [
      hasDomain ? '✓ NEXT_PUBLIC_SHOPIFY_DOMAIN cargada' : '✗ NEXT_PUBLIC_SHOPIFY_DOMAIN faltante',
      hasToken ? '✓ SHOPIFY_ADMIN_TOKEN cargada' : '✗ SHOPIFY_ADMIN_TOKEN faltante',
      'Si las acabas de meter en .env.local, reinicia el dev server (Ctrl+C y npm run dev).',
      'Si estás en Vercel, configúralas en Settings → Environment Variables y vuelve a desplegar.',
    ]
  } else if (reason === 'not-found') {
    title = 'No se encontró el producto'
    description = `El handle "${PRODUCT_HANDLE}" no existe en tu tienda Shopify.`
    helpItems = [
      'Verifica el handle en Shopify Admin → Productos → tu producto → URL.',
      'Ajusta NEXT_PUBLIC_SHOPIFY_PRODUCT_HANDLE en .env.local con el valor correcto.',
    ]
  } else {
    title = 'Error al consultar Shopify'
    description = error ?? 'La API de Shopify devolvió un error.'
    helpItems = [
      'Verifica que el token tenga el scope read_products habilitado.',
      'Revisa los logs del servidor para más detalles.',
    ]
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-24">
      <h1 className="font-display text-3xl font-extrabold text-ink-strong">
        {title}
      </h1>
      <p className="mt-4 text-ink-light">{description}</p>
      <ul className="mt-6 space-y-2 rounded-2xl border border-border bg-surface p-5 text-sm text-ink">
        {helpItems.map((item) => (
          <li key={item} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
