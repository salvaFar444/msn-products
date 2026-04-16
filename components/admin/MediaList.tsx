'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import MediaUploader from './MediaUploader'
import type { ProductMedia, MediaType } from '@/types'

interface MediaListProps {
  productId: string
  initial: ProductMedia[]
}

function SortableCard({
  media,
  busyId,
  onSetPrimary,
  onDelete,
}: {
  media: ProductMedia
  busyId: string | null
  onSetPrimary: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: media.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  const isImage = media.mediaType === 'image'
  const rowBusy = busyId === media.id

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex flex-col overflow-hidden rounded-xl border"
    >
      <div
        className="relative aspect-square w-full"
        style={{
          backgroundColor: '#0A0A0A',
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        {isImage ? (
          <Image
            src={media.url}
            alt="media"
            fill
            sizes="160px"
            className="object-contain"
          />
        ) : (
          <video
            src={media.url}
            className="h-full w-full object-contain"
            muted
            playsInline
            preload="metadata"
          />
        )}

        {/* Drag handle (top-left) */}
        <button
          type="button"
          className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80"
          aria-label="Arrastrar para reordenar"
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab', touchAction: 'none' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M9 5h2v2H9V5Zm0 6h2v2H9v-2Zm0 6h2v2H9v-2Zm4-12h2v2h-2V5Zm0 6h2v2h-2v-2Zm0 6h2v2h-2v-2Z" />
          </svg>
        </button>

        {/* Type badge (top-right) */}
        <span
          className="absolute right-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase"
          style={{
            backgroundColor: isImage ? 'rgba(59,130,246,0.9)' : 'rgba(232,122,0,0.9)',
            color: '#FFFFFF',
          }}
        >
          {isImage ? 'IMG' : 'VIDEO'}
        </span>

        {media.isPrimary && isImage && (
          <span
            className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-[#E87A00] px-1.5 py-0.5 text-[10px] font-semibold text-white"
            aria-label="Imagen principal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5" aria-hidden="true">
              <path d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.18 5.3 5.72.45a.56.56 0 0 1 .32.98l-4.36 3.73 1.32 5.57a.56.56 0 0 1-.84.61L12 17.23l-4.86 2.91a.56.56 0 0 1-.84-.61l1.32-5.57L3.26 10.23a.56.56 0 0 1 .32-.98l5.72-.45 2.18-5.3Z" />
            </svg>
            Principal
          </span>
        )}
      </div>

      <div
        className="flex items-center justify-between gap-2 px-2 py-1.5"
        style={{ backgroundColor: '#141414', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {isImage ? (
          <button
            type="button"
            disabled={media.isPrimary || rowBusy}
            onClick={() => onSetPrimary(media.id)}
            className="text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color: media.isPrimary ? '#E87A00' : 'rgba(255,255,255,0.65)' }}
          >
            {media.isPrimary ? '★ Principal' : 'Marcar como principal'}
          </button>
        ) : (
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Video
          </span>
        )}

        <button
          type="button"
          disabled={rowBusy}
          onClick={() => {
            if (confirm('¿Eliminar este archivo?')) onDelete(media.id)
          }}
          className="text-[11px] font-medium text-white/60 transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}

export default function MediaList({ productId, initial }: MediaListProps) {
  // Local optimistic state — refreshed from the server on every mutation.
  const [items, setItems] = useState<ProductMedia[]>(
    [...initial].sort((a, b) => a.position - b.position),
  )
  const [busyId, setBusyId] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const persistReorder = async (next: ProductMedia[]) => {
    setServerError(null)
    const order = next.map((m, i) => ({ id: m.id, position: i }))
    const res = await fetch('/api/admin/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', productId, order }),
    })
    if (!res.ok) {
      setServerError('No se pudo reordenar. Recarga la página.')
    }
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((m) => m.id === active.id)
    const newIndex = items.findIndex((m) => m.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(items, oldIndex, newIndex).map((m, i) => ({ ...m, position: i }))
    setItems(next)
    void persistReorder(next)
  }

  const handleSetPrimary = async (mediaId: string) => {
    setBusyId(mediaId)
    setServerError(null)
    const res = await fetch('/api/admin/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setPrimary', productId, mediaId }),
    })
    if (res.ok) {
      setItems((prev) =>
        prev.map((m) => ({ ...m, isPrimary: m.id === mediaId && m.mediaType === 'image' })),
      )
    } else {
      setServerError('No se pudo marcar como principal.')
    }
    setBusyId(null)
  }

  const handleDelete = async (mediaId: string) => {
    setBusyId(mediaId)
    setServerError(null)
    const res = await fetch(
      `/api/admin/media?id=${encodeURIComponent(mediaId)}&productId=${encodeURIComponent(productId)}`,
      { method: 'DELETE' },
    )
    if (res.ok) {
      setItems((prev) => prev.filter((m) => m.id !== mediaId))
    } else {
      setServerError('No se pudo eliminar.')
    }
    setBusyId(null)
  }

  const handleUploaded = async (payload: { url: string; mediaType: MediaType }) => {
    setServerError(null)
    const noPrimaryYet = !items.some((m) => m.isPrimary && m.mediaType === 'image')
    const res = await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        url: payload.url,
        mediaType: payload.mediaType,
        position: items.length,
        isPrimary: payload.mediaType === 'image' && noPrimaryYet,
      }),
    })
    const json = (await res.json().catch(() => ({}))) as {
      media?: ProductMedia
      error?: string
    }
    if (res.ok && json.media) {
      setItems((prev) => [...prev, json.media!])
    } else {
      setServerError(json.error ?? 'No se pudo registrar el archivo.')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">Galería de fotos y videos</label>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {items.length} archivo{items.length === 1 ? '' : 's'}
        </span>
      </div>

      <MediaUploader
        productId={productId}
        currentCount={items.length}
        onUploaded={handleUploaded}
      />

      {serverError && (
        <p className="text-xs font-medium" style={{ color: '#FCA5A5' }}>
          {serverError}
        </p>
      )}

      {items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((m) => m.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {items.map((media) => (
                <SortableCard
                  key={media.id}
                  media={media}
                  busyId={busyId}
                  onSetPrimary={handleSetPrimary}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {items.length === 0 && (
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Todavía no hay archivos. Agrega al menos una imagen para que el producto se muestre bien.
        </p>
      )}
    </div>
  )
}
