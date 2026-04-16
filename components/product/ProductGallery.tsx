'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Play } from 'lucide-react'
import type { ProductMedia } from '@/types'

interface ProductGalleryProps {
  media: ProductMedia[]
  productName: string
  fallbackImage: string
}

// A media gallery with a big main viewer + horizontal thumbnail row.
// Images show via next/image; videos get native <video> with controls.
// If the product has no media rows yet, we fall back to `fallbackImage`
// so the detail page still looks intact during the migration period.
export default function ProductGallery({
  media,
  productName,
  fallbackImage,
}: ProductGalleryProps) {
  // Normalize input: sorted by position, primary images first.
  const items: ProductMedia[] = useMemo(() => {
    if (media.length > 0) {
      return [...media].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1
        if (!a.isPrimary && b.isPrimary) return 1
        return a.position - b.position
      })
    }
    // Fallback: single pseudo-media from `fallbackImage` so the UI renders.
    return [
      {
        id: 'fallback',
        productId: 'fallback',
        url: fallbackImage,
        mediaType: 'image' as const,
        position: 0,
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
    ]
  }, [media, fallbackImage])

  const [activeIndex, setActiveIndex] = useState(0)
  const active = items[activeIndex] ?? items[0]

  return (
    <div className="space-y-3">
      {/* Main viewer */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface"
        style={{ border: '1px solid rgba(0,0,0,0.06)' }}
      >
        {active.mediaType === 'image' ? (
          <Image
            src={active.url}
            alt={productName}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-4"
            priority
          />
        ) : (
          <video
            key={active.id}
            src={active.url}
            controls
            playsInline
            className="h-full w-full object-contain"
          />
        )}
      </div>

      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Galería de imágenes y videos">
          {items.map((m, i) => {
            const isActive = i === activeIndex
            const isImage = m.mediaType === 'image'
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={isImage ? `Ver imagen ${i + 1}` : `Ver video ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface transition-all"
                style={{
                  border: isActive
                    ? '2px solid var(--color-accent, #E87A00)'
                    : '1px solid rgba(0,0,0,0.08)',
                  opacity: isActive ? 1 : 0.75,
                }}
              >
                {isImage ? (
                  <Image
                    src={m.url}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                ) : (
                  <>
                    <video
                      src={m.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-5 w-5 text-white" strokeWidth={2.5} fill="currentColor" aria-hidden="true" />
                    </div>
                  </>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
