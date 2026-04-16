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
import { X, Star, Video as VideoIcon, GripVertical } from 'lucide-react'
import MediaUploader from './MediaUploader'
import { MAX_MEDIA_PER_PRODUCT } from '@/lib/constants'
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
      className="group relative aspect-square overflow-hidden rounded-xl"
    >
      {/* Media */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem' }}
      >
        {isImage ? (
          <Image src={media.url} alt="" fill sizes="160px" className="object-contain" />
        ) : (
          <video
            src={media.url}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        )}
      </div>

      {/* Delete — X in top-right */}
      <button
        type="button"
        disabled={rowBusy}
        onClick={(e) => {
          e.stopPropagation()
          if (confirm('¿Eliminar este archivo?')) onDelete(media.id)
        }}
        aria-label="Eliminar archivo"
        className="absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
      </button>

      {/* Drag handle — top-left */}
      <button
        type="button"
        aria-label="Arrastrar para reordenar"
        {...attributes}
        {...listeners}
        style={{ cursor: 'grab', touchAction: 'none' }}
        className="absolute left-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80"
      >
        <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {/* Video indicator — bottom-right */}
      {!isImage && (
        <span
          className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white backdrop-blur-sm"
          aria-label="Video"
        >
          <VideoIcon className="h-2.5 w-2.5" aria-hidden="true" strokeWidth={2.5} />
          Video
        </span>
      )}

      {/* Primary toggle — bottom-left (images only) */}
      {isImage && (
        <button
          type="button"
          disabled={rowBusy}
          onClick={(e) => {
            e.stopPropagation()
            if (!media.isPrimary) onSetPrimary(media.id)
          }}
          aria-label={media.isPrimary ? 'Imagen principal' : 'Marcar como principal'}
          aria-pressed={media.isPrimary}
          className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            backgroundColor: media.isPrimary ? '#E87A00' : 'rgba(0,0,0,0.7)',
            color: '#FFFFFF',
          }}
        >
          <Star
            className="h-2.5 w-2.5"
            aria-hidden="true"
            strokeWidth={2.5}
            fill={media.isPrimary ? 'currentColor' : 'none'}
          />
          {media.isPrimary ? 'Principal' : 'Marcar'}
        </button>
      )}
    </div>
  )
}

export default function MediaList({ productId, initial }: MediaListProps) {
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
    if (!res.ok) setServerError('No se pudo reordenar. Recarga la página.')
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

  const canAdd = items.length < MAX_MEDIA_PER_PRODUCT

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">Galería de fotos y videos</label>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {items.length}/{MAX_MEDIA_PER_PRODUCT}
        </span>
      </div>

      {serverError && (
        <p className="text-xs font-medium" style={{ color: '#FCA5A5' }}>
          {serverError}
        </p>
      )}

      {/* Single grid: existing media + uploader tile share the same row */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((m) => m.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {items.map((media) => (
              <SortableCard
                key={media.id}
                media={media}
                busyId={busyId}
                onSetPrimary={handleSetPrimary}
                onDelete={handleDelete}
              />
            ))}

            {canAdd && (
              <MediaUploader
                productId={productId}
                currentCount={items.length}
                onUploaded={handleUploaded}
                variant="tile"
              />
            )}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Todavía no hay archivos. Agrega al menos una imagen para que el producto se vea bien en la tienda.
        </p>
      )}

      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Arrastra para reordenar · <Star className="inline h-2.5 w-2.5" aria-hidden="true" /> marca la imagen principal (la que sale en las tarjetas del home) · Imagen ≤5MB · Video MP4/WebM ≤20MB
      </p>
    </div>
  )
}
