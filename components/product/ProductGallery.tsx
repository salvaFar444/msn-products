'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Play, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import type { ProductMedia } from '@/types'

interface ProductGalleryProps {
  media: ProductMedia[]
  productName: string
  fallbackImage: string
}

/**
 * ProductGallery — estilo Mercado Libre.
 *
 * Desktop (lg+):
 *   - Columna izquierda: thumbnails verticales (click o hover → cambia el viewer)
 *   - Columna derecha: viewer principal con zoom al hacer hover (imagen) o controls (video)
 *   - Botón "expandir" → lightbox fullscreen con navegación con flechas/teclado
 *
 * Mobile:
 *   - Viewer arriba (aspect-square), thumbnails horizontales debajo
 *   - Swipe con flechas en los lados del viewer
 */
export default function ProductGallery({
  media,
  productName,
  fallbackImage,
}: ProductGalleryProps) {
  // Normalize: primary first, then by position
  const items: ProductMedia[] = useMemo(() => {
    if (media.length > 0) {
      return [...media].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1
        if (!a.isPrimary && b.isPrimary) return 1
        return a.position - b.position
      })
    }
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
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null)
  const viewerRef = useRef<HTMLDivElement>(null)

  const active = items[activeIndex] ?? items[0]
  const canNavigate = items.length > 1

  const goTo = useCallback(
    (i: number) => {
      if (items.length === 0) return
      const next = ((i % items.length) + items.length) % items.length
      setActiveIndex(next)
      setZoomPos(null)
    },
    [items.length],
  )

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (active.mediaType !== 'image') return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  return (
    <>
      {/* ─── DESKTOP (lg+): thumbnails verticales + viewer grande ─── */}
      <div className="hidden lg:flex lg:gap-3">
        {/* Thumbnail column */}
        {items.length > 1 && (
          <div
            className="flex w-20 shrink-0 flex-col gap-2 overflow-y-auto pr-1"
            style={{ maxHeight: '520px' }}
            role="tablist"
            aria-label="Miniaturas"
          >
            {items.map((m, i) => (
              <ThumbnailButton
                key={m.id}
                media={m}
                index={i}
                isActive={i === activeIndex}
                onActivate={() => goTo(i)}
                productName={productName}
              />
            ))}
          </div>
        )}

        {/* Main viewer */}
        <div
          ref={viewerRef}
          className="relative flex-1 aspect-square overflow-hidden rounded-2xl bg-surface"
          style={{ border: '1px solid rgba(0,0,0,0.06)', maxHeight: '520px' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomPos(null)}
        >
          {active.mediaType === 'image' ? (
            <>
              <Image
                src={active.url}
                alt={productName}
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-contain p-6"
                priority
                style={{
                  transform: zoomPos ? `scale(2)` : undefined,
                  transformOrigin: zoomPos ? `${zoomPos.x}% ${zoomPos.y}%` : undefined,
                  transition: zoomPos ? 'none' : 'transform 150ms ease-out',
                  cursor: 'zoom-in',
                }}
              />
              {/* Expand button → lightbox */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label="Ver en pantalla completa"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-md transition-all hover:bg-white hover:scale-110"
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <video
              key={active.id}
              src={active.url}
              controls
              playsInline
              preload="metadata"
              controlsList="nodownload"
              className="relative z-20 h-full w-full object-contain"
            />
          )}

          {/* Arrow nav — ocultas si estamos viendo un video para no tapar los controles */}
          {canNavigate && active.mediaType === 'image' && (
            <>
              <NavArrow direction="left" onClick={() => goTo(activeIndex - 1)} />
              <NavArrow direction="right" onClick={() => goTo(activeIndex + 1)} />
            </>
          )}
        </div>
      </div>

      {/* ─── MOBILE: viewer arriba, thumbnails horizontales debajo ─── */}
      <div className="lg:hidden space-y-3">
        <div
          className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface"
          style={{ border: '1px solid rgba(0,0,0,0.06)' }}
        >
          {active.mediaType === 'image' ? (
            <Image
              src={active.url}
              alt={productName}
              fill
              sizes="100vw"
              className="object-contain p-4"
              priority
            />
          ) : (
            <video
              key={active.id}
              src={active.url}
              controls
              playsInline
              preload="metadata"
              controlsList="nodownload"
              className="relative z-20 h-full w-full object-contain"
            />
          )}

          {canNavigate && active.mediaType === 'image' && (
            <>
              <NavArrow direction="left" onClick={() => goTo(activeIndex - 1)} />
              <NavArrow direction="right" onClick={() => goTo(activeIndex + 1)} />
            </>
          )}

          {/* Dot indicator — oculto en video para no tapar controles */}
          {canNavigate && active.mediaType === 'image' && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
              {items.map((_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === activeIndex ? '16px' : '6px',
                    backgroundColor: i === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 1 && (
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            role="tablist"
            aria-label="Miniaturas"
          >
            {items.map((m, i) => (
              <ThumbnailButton
                key={m.id}
                media={m}
                index={i}
                isActive={i === activeIndex}
                onActivate={() => goTo(i)}
                productName={productName}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Lightbox fullscreen ─── */}
      {lightboxOpen && (
        <Lightbox
          items={items}
          activeIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={goTo}
          productName={productName}
        />
      )}
    </>
  )
}

// ──────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────

function ThumbnailButton({
  media,
  index,
  isActive,
  onActivate,
  productName,
}: {
  media: ProductMedia
  index: number
  isActive: boolean
  onActivate: () => void
  productName: string
}) {
  const isImage = media.mediaType === 'image'
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-label={isImage ? `Ver imagen ${index + 1} de ${productName}` : `Ver video ${index + 1}`}
      onClick={onActivate}
      onMouseEnter={onActivate}
      className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface transition-all lg:h-16 lg:w-16"
      style={{
        border: isActive ? '2px solid #0A0A0A' : '1px solid rgba(0,0,0,0.08)',
        opacity: isActive ? 1 : 0.75,
      }}
    >
      {isImage ? (
        <Image src={media.url} alt="" fill sizes="64px" className="object-contain p-1" />
      ) : (
        <>
          <video
            src={media.url}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="h-4 w-4 text-white" strokeWidth={2.5} fill="currentColor" aria-hidden="true" />
          </div>
        </>
      )}
    </button>
  )
}

function NavArrow({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'left' ? 'Anterior' : 'Siguiente'}
      className="absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
      style={{ [direction]: '12px' } as React.CSSProperties}
    >
      <Icon className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
    </button>
  )
}

function Lightbox({
  items,
  activeIndex,
  onClose,
  onNavigate,
  productName,
}: {
  items: ProductMedia[]
  activeIndex: number
  onClose: () => void
  onNavigate: (i: number) => void
  productName: string
}) {
  const active = items[activeIndex]

  // Keyboard shortcuts + body scroll lock while lightbox is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate(activeIndex - 1)
      if (e.key === 'ArrowRight') onNavigate(activeIndex + 1)
    }
    window.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, onNavigate, activeIndex])

  if (!active) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Galería ampliada de ${productName}`}
      onClick={onClose}
    >
      {/* Content */}
      <div className="relative h-full w-full" onClick={(e) => e.stopPropagation()}>
        {active.mediaType === 'image' ? (
          <Image
            src={active.url}
            alt={productName}
            fill
            sizes="100vw"
            className="object-contain p-8 sm:p-16"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 sm:p-8">
            <video
              key={active.id}
              src={active.url}
              controls
              autoPlay
              playsInline
              className="max-h-full max-w-full"
            />
          </div>
        )}

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          <X className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
        </button>

        {/* Counter */}
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm text-white backdrop-blur-sm">
          {activeIndex + 1} / {items.length}
        </div>

        {/* Nav */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onNavigate(activeIndex - 1)}
              aria-label="Anterior"
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate(activeIndex + 1)}
              aria-label="Siguiente"
              className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <ChevronRight className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

