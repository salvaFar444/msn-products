import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { formatCOP } from '@/lib/formatCurrency'
import type { ShopifyProduct } from '@/lib/shopify'

interface RelatedProductsProps {
  products: ShopifyProduct[]
}

/**
 * Carrusel horizontal con scroll-snap nativo. Sin librerías.
 * Cada card es un link al producto en Shopify (vía /products/[handle]
 * de la propia tienda Shopify, lo que evita mantener páginas de detalle
 * paralelas).
 */
export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null

  // Tomamos hasta 8.
  const list = products.slice(0, 8)
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN

  function buildHref(handle: string): string {
    if (shopifyDomain) {
      return `https://${shopifyDomain}/products/${handle}`
    }
    // Fallback: usa la página de detalle existente (admin/preview).
    return `/producto/${handle}`
  }

  return (
    <section className="bg-surface py-14 sm:py-20" aria-label="Productos relacionados">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2
              className="font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-strong sm:text-3xl"
              style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2rem)' }}
            >
              También te podría interesar
            </h2>
            <p className="mt-1 text-sm text-ink-light">
              Accesorios populares para complementar tu intercomunicador.
            </p>
          </div>
        </header>
      </div>

      <div className="scroll-snap-x flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:gap-5 sm:px-6 lg:px-8">
        {list.map((p) => {
          const variant = p.defaultVariant
          const price = variant?.price
          const compareAt = variant?.compareAtPrice
          const cover = p.images[0]
          return (
            <a
              key={p.id}
              href={buildHref(p.handle)}
              target={shopifyDomain ? '_self' : '_self'}
              className="scroll-snap-start group flex w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-white transition-all duration-200 hover:border-ink-strong hover:shadow-card-hover sm:w-[300px]"
            >
              <div className="relative aspect-square w-full bg-surface">
                {cover ? (
                  <Image
                    src={cover.url}
                    alt={cover.altText ?? p.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 260px, 300px"
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-xs text-ink-muted">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink-strong sm:text-base">
                  {p.title}
                </h3>
                {price && (
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-lg font-extrabold text-ink-strong">
                      {formatCOP(Number(price.amount))}
                    </span>
                    {compareAt && Number(compareAt.amount) > Number(price.amount) && (
                      <span className="text-xs font-medium text-ink-muted line-through">
                        {formatCOP(Number(compareAt.amount))}
                      </span>
                    )}
                  </div>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-strong">
                  Ver producto
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </a>
          )
        })}
        {/* Espacio final para que el último card no quede pegado al borde */}
        <div aria-hidden="true" className="w-2 shrink-0" />
      </div>
    </section>
  )
}
