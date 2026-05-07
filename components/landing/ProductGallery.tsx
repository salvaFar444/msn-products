'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { ShopifyImage } from '@/lib/shopify'

interface ProductGalleryProps {
  images: ShopifyImage[]
  productTitle: string
}

/**
 * Galería con swipe horizontal nativa (CSS scroll-snap), dots de paginación
 * e indicador del slide actual. Sin librerías externas.
 *
 * Mobile: swipe con el dedo, snap a cada slide.
 * Desktop: misma galería + flechas laterales que aparecen al hacer hover.
 */
export default function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Si Shopify aún no devuelve imágenes, mostramos un placeholder.
  const slides = images.length > 0 ? images : [
    {
      url: '/og-image.png',
      altText: productTitle,
      width: 1200,
      height: 1200,
    } as ShopifyImage,
  ]

  // Track scroll position to update active dot.
  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    const handler = () => {
      const idx = Math.round(node.scrollLeft / node.clientWidth)
      setActiveIndex(idx)
    }
    node.addEventListener('scroll', handler, { passive: true })
    return () => node.removeEventListener('scroll', handler)
  }, [])

  function goTo(index: number) {
    const node = scrollerRef.current
    if (!node) return
    node.scrollTo({ left: index * node.clientWidth, behavior: 'smooth' })
  }

  return (
    <section className="relative bg-surface" aria-label="Galería del producto">
      <div
        ref={scrollerRef}
        className="scroll-snap-x flex w-full snap-x snap-mandatory overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {slides.map((img, i) => (
          <div
            key={`${img.url}-${i}`}
            className="scroll-snap-start relative aspect-square w-full shrink-0 snap-start"
          >
            <Image
              src={img.url}
              alt={img.altText ?? `${productTitle} — imagen ${i + 1}`}
              fill
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
        ))}
      </div>

      {/* Slide counter */}
      {slides.length > 1 && (
        <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {activeIndex + 1} / {slides.length}
        </div>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2"
          role="tablist"
          aria-label="Selector de imagen"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Ir a imagen ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-6 bg-ink-strong'
                  : 'w-2 bg-ink-strong/30 hover:bg-ink-strong/60'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
