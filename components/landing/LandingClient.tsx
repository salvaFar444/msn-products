'use client'

import { useState } from 'react'
import { Flame, Truck, Lock, ShieldCheck, ArrowRight } from 'lucide-react'
import ProductGallery from './ProductGallery'
import PriceDisplay from './PriceDisplay'
import QuantitySelector from './QuantitySelector'
import BuyButtons from './BuyButtons'
import BenefitsBadges from './BenefitsBadges'
import StorytellingSection from './StorytellingSection'
import ReviewsSection from './ReviewsSection'
import GuaranteeSection from './GuaranteeSection'
import RelatedProducts from './RelatedProducts'
import StickyAddToCart from './StickyAddToCart'
import LandingFooter from './LandingFooter'
import type { ShopifyProduct } from '@/lib/shopify'

interface LandingClientProps {
  product: ShopifyProduct
  related: ShopifyProduct[]
}

/**
 * Cliente del landing — maneja la cantidad seleccionada y orquesta
 * todas las secciones. Recibe el producto principal y los relacionados
 * desde el server component (page.tsx).
 */
export default function LandingClient({ product, related }: LandingClientProps) {
  const [quantity, setQuantity] = useState(1)
  const variant = product.defaultVariant

  // Calculamos stock visible (si Shopify lo expone). Si no, asumimos disponible.
  const inStock = product.availableForSale && (variant?.availableForSale ?? true)
  const lowStock =
    typeof variant?.quantityAvailable === 'number' &&
    variant.quantityAvailable > 0 &&
    variant.quantityAvailable <= 10

  return (
    <>
      {/* ─── SECCIÓN 1: HERO ─────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 lg:grid-cols-2 lg:gap-10">
          {/* Galería */}
          <div className="relative">
            {/* Badge flotante */}
            <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-ink-strong px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-card">
              <Flame
                className="h-3.5 w-3.5 text-warning"
                strokeWidth={2.6}
                aria-hidden="true"
              />
              {lowStock ? 'Stock limitado' : 'Más vendido'}
            </div>
            <ProductGallery images={product.images} productTitle={product.title} />
          </div>

          {/* Info / CTA */}
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:py-10">
            <h1
              className="font-display font-extrabold leading-[1.05] tracking-tight text-ink-strong"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)' }}
            >
              {product.title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-light sm:text-base">
              {product.description ||
                'Kit de 2 intercomunicadores Bluetooth 5.3 con cancelación de ruido dual, IP67 y 42 horas de batería.'}
            </p>

            {/* Precio */}
            <div className="mt-6">
              {variant && (
                <PriceDisplay
                  price={variant.price}
                  compareAtPrice={variant.compareAtPrice}
                  size="lg"
                />
              )}
              {lowStock && (
                <p className="mt-2 text-xs font-semibold text-warning">
                  Quedan solo {variant?.quantityAvailable} unidades
                </p>
              )}
              {!inStock && (
                <p className="mt-2 text-xs font-semibold text-danger">
                  Agotado temporalmente
                </p>
              )}
            </div>

            {/* Cantidad */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-semibold text-ink-strong">
                Cantidad
              </span>
              <QuantitySelector value={quantity} onChange={setQuantity} />
            </div>

            {/* CTAs principales */}
            <div id="hero-cta" className="mt-6">
              <BuyButtons variant={variant} quantity={quantity} trackingId="hero" />
            </div>

            {/* Trust badges en línea horizontal */}
            <ul
              className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl border border-border bg-surface px-4 py-3 sm:justify-around"
              aria-label="Garantías de la tienda"
            >
              <li className="flex items-center gap-2 text-xs font-semibold text-ink-strong sm:text-sm">
                <Truck className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                Envío gratis
              </li>
              <li className="flex items-center gap-2 text-xs font-semibold text-ink-strong sm:text-sm">
                <Lock className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                Pago seguro
              </li>
              <li className="flex items-center gap-2 text-xs font-semibold text-ink-strong sm:text-sm">
                <ShieldCheck className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                Garantía 3 meses
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── SECCIÓN 2: PROPUESTA DE VALOR ──────────────────────── */}
      <BenefitsBadges />

      {/* ─── SECCIÓN 3: STORYTELLING + IMÁGENES + SPECS ─────────── */}
      <StorytellingSection
        images={product.images}
        productTitle={product.title}
      />

      {/* ─── SECCIÓN 4: SEGUNDO CTA ─────────────────────────────── */}
      <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-lg rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <h2
            className="font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-strong sm:text-3xl"
            style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2rem)' }}
          >
            Llévatelo hoy con envío gratis.
          </h2>
          {variant && (
            <div className="mt-4">
              <PriceDisplay
                price={variant.price}
                compareAtPrice={variant.compareAtPrice}
                size="md"
              />
            </div>
          )}
          <div className="mt-5 flex items-center gap-4">
            <span className="text-sm font-semibold text-ink-strong">
              Cantidad
            </span>
            <QuantitySelector value={quantity} onChange={setQuantity} size="sm" />
          </div>
          <div className="mt-5">
            <BuyButtons
              variant={variant}
              quantity={quantity}
              trackingId="repeat"
            />
          </div>
        </div>
      </section>

      {/* ─── SECCIÓN 5: RESEÑAS ─────────────────────────────────── */}
      <ReviewsSection />

      {/* ─── SECCIÓN 6: GARANTÍA ────────────────────────────────── */}
      <div id="garantia">
        <GuaranteeSection />
      </div>

      {/* ─── SECCIÓN 7: PRODUCTOS RELACIONADOS ──────────────────── */}
      <RelatedProducts products={related} />

      {/* Footer minimal */}
      <LandingFooter />

      {/* Sticky bar móvil */}
      <StickyAddToCart
        product={product}
        variant={variant}
        quantity={quantity}
        triggerId="hero-cta"
      />

      {/* Schema.org Product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            description: product.description,
            image: product.images.map((i) => i.url),
            sku: product.id,
            brand: { '@type': 'Brand', name: 'JZAQ' },
            offers: variant
              ? {
                  '@type': 'Offer',
                  priceCurrency: variant.price.currencyCode,
                  price: variant.price.amount,
                  availability: inStock
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                }
              : undefined,
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              reviewCount: '47',
            },
          }),
        }}
      />

      {/* Anchor "Política de envíos" — placeholder */}
      <span id="envios" aria-hidden="true" />
      {/* Hint visual para usuarios que llegaron al final */}
      <p className="bg-surface px-4 py-6 text-center text-xs text-ink-muted">
        ¿Quieres ver más accesorios? Escríbenos por WhatsApp para opciones
        personalizadas <ArrowRight className="inline h-3 w-3" aria-hidden="true" />
      </p>
    </>
  )
}
