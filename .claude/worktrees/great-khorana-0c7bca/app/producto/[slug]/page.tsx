import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Check } from 'lucide-react'
import ProductGallery from '@/components/product/ProductGallery'
import ProductDetailClient from '@/components/product/ProductDetailClient'
import ReviewsList from '@/components/product/ReviewsList'
import RelatedProducts from '@/components/product/RelatedProducts'
import {
  getProductBySlug,
  getRelatedProducts,
  getReviewsForProduct,
  summarizeReviews,
  PRODUCTS_REVALIDATE_SECONDS,
} from '@/lib/products'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { SITE } from '@/data/site'

export const revalidate = PRODUCTS_REVALIDATE_SECONDS

interface Props {
  params: { slug: string }
}

// ─── Metadata (SEO) ────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) {
    return { title: 'Producto no encontrado' }
  }

  const title = `${product.name} — ${SITE.city}`
  const description = product.description.slice(0, 160)
  const canonical = `${SITE_URL}/producto/${product.slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: product.image, width: 1200, height: 1200, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.image],
    },
  }
}

// ─── Page ──────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  const [reviews, related] = await Promise.all([
    getReviewsForProduct(product.id),
    getRelatedProducts(product.category, product.id, 4),
  ])
  const summary = summarizeReviews(reviews)

  // Schema.org JSON-LD — helps Google show rich results (stars, price, stock)
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [product.image],
    sku: product.id,
    category: product.category,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/producto/${product.slug}`,
      priceCurrency: 'COP',
      price: product.price,
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      areaServed: { '@type': 'City', name: SITE.city },
    },
    ...(summary
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: summary.average,
            reviewCount: summary.count,
          },
          review: reviews.slice(0, 5).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.authorName },
            datePublished: r.createdAt,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
            },
            reviewBody: r.comment,
          })),
        }
      : {}),
  }

  const specsEntries = product.specs ? Object.entries(product.specs) : []

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-12">
      {/* JSON-LD — Schema.org Product */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-ink-light" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink-strong transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link
          href={`/#${product.category.toLowerCase()}`}
          className="hover:text-ink-strong transition-colors"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="truncate font-medium text-ink-strong">{product.name}</span>
      </nav>

      {/* Hero — gallery + purchase block */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          media={product.media ?? []}
          productName={product.name}
          fallbackImage={product.image}
        />

        <div className="space-y-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-light">
            {product.category}
          </p>

          <h1 className="text-3xl font-extrabold leading-tight text-ink-strong sm:text-4xl">
            {product.name}
          </h1>

          <p className="text-base leading-relaxed text-ink-light">
            {product.description}
          </p>

          {/* Key features */}
          {product.features.length > 0 && (
            <ul className="space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink">
                  <Check
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink"
                    aria-hidden="true"
                    strokeWidth={3}
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}

          <ProductDetailClient product={product} />
        </div>
      </div>

      {/* Extended description */}
      {product.longDescription && (
        <section className="mt-16 max-w-3xl">
          <h2 className="mb-4 text-2xl font-extrabold text-ink-strong">Sobre este producto</h2>
          <p className="whitespace-pre-line text-base leading-relaxed text-ink">
            {product.longDescription}
          </p>
        </section>
      )}

      {/* Specs table */}
      {specsEntries.length > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-4 text-2xl font-extrabold text-ink-strong">Ficha técnica</h2>
          <dl
            className="grid grid-cols-1 overflow-hidden rounded-2xl bg-white sm:grid-cols-2"
            style={{ border: '1px solid rgba(0,0,0,0.08)' }}
          >
            {specsEntries.map(([key, value], i) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                style={{
                  borderTop: i > 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  borderLeft:
                    i % 2 === 1 && specsEntries.length > 1
                      ? '1px solid rgba(0,0,0,0.06)'
                      : 'none',
                }}
              >
                <dt className="font-semibold text-ink-light">{key}</dt>
                <dd className="text-right font-medium text-ink-strong">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Reviews */}
      {summary && (
        <div className="mt-16">
          <ReviewsList reviews={reviews} summary={summary} />
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-16">
          <RelatedProducts products={related} />
        </div>
      )}
    </div>
  )
}
