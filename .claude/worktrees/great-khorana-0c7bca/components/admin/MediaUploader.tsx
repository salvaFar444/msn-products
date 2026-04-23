'use client'

import { useRef, useState } from 'react'
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
  MAX_MEDIA_PER_PRODUCT,
} from '@/lib/constants'
import type { MediaType } from '@/types'

interface MediaUploaderProps {
  productId: string
  currentCount: number
  onUploaded: (payload: { url: string; mediaType: MediaType }) => void
  // 'default' = full-width dropzone (new product flow)
  // 'tile'    = square tile that fits inside the MediaList grid
  variant?: 'default' | 'tile'
}

const ACCEPT = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(',')

function validate(file: File): string | null {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      return `La imagen no puede superar ${MAX_IMAGE_SIZE_MB}MB.`
    }
    return null
  }
  if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      return `El video no puede superar ${MAX_VIDEO_SIZE_MB}MB.`
    }
    return null
  }
  return 'Tipo no soportado. Usa JPG/PNG/WebP o MP4/WebM.'
}

export default function MediaUploader({
  productId,
  currentCount,
  onUploaded,
  variant = 'default',
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const atLimit = currentCount >= MAX_MEDIA_PER_PRODUCT

  const processFile = async (file: File) => {
    setError(null)
    if (atLimit) {
      setError(`Ya llegaste al máximo de ${MAX_MEDIA_PER_PRODUCT} archivos.`)
      return
    }
    const v = validate(file)
    if (v) {
      setError(v)
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('productId', productId)
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd })
      const json = (await res.json().catch(() => ({}))) as {
        url?: string
        mediaType?: MediaType
        error?: string
        hint?: string
      }
      if (!res.ok || !json.url || !json.mediaType) {
        const base = json.error ?? 'Error al subir el archivo.'
        setError(json.hint ? `${base} — ${json.hint}` : base)
        return
      }
      onUploaded({ url: json.url, mediaType: json.mediaType })
    } catch (e) {
      console.error('[MediaUploader]', e)
      setError('Error de red. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    if (inputRef.current) inputRef.current.value = '' // allow re-upload of same name
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const isTile = variant === 'tile'

  const dropzone = (
    <div
      onClick={() => !uploading && !atLimit && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!atLimit) setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={[
        'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors',
        isTile ? 'aspect-square p-2' : 'p-6',
        atLimit || uploading ? 'cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
      style={{
        borderColor: isDragging ? '#FFFFFF' : 'rgba(255,255,255,0.12)',
        backgroundColor: isDragging ? 'rgba(255,255,255,0.06)' : '#1A1A1A',
        opacity: atLimit ? 0.5 : 1,
      }}
      role="button"
      tabIndex={0}
      aria-label="Subir imagen o video"
      aria-disabled={atLimit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !uploading && !atLimit) inputRef.current?.click()
      }}
    >
      <div className="flex flex-col items-center gap-1.5 text-center" style={{ color: 'rgba(255,255,255,0.65)' }}>
        {uploading ? (
          <>
            <svg className={isTile ? 'h-5 w-5 animate-spin' : 'h-6 w-6 animate-spin'} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className={isTile ? 'text-[11px]' : 'text-sm'}>Subiendo…</p>
          </>
        ) : isTile ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-7 w-7" aria-hidden="true" style={{ color: '#FFFFFF' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <p className="text-[11px] font-semibold leading-tight">
              Agregar<br/>foto o video
            </p>
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {currentCount}/{MAX_MEDIA_PER_PRODUCT}
            </p>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
            </svg>
            <p className="text-sm">
              <span className="font-semibold" style={{ color: '#FFFFFF' }}>Haz clic</span> o arrastra aquí
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Imagen ≤{MAX_IMAGE_SIZE_MB}MB · Video ≤{MAX_VIDEO_SIZE_MB}MB · Máx {MAX_MEDIA_PER_PRODUCT} ({currentCount}/{MAX_MEDIA_PER_PRODUCT})
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        disabled={uploading || atLimit}
      />
    </div>
  )

  return (
    <div className={isTile ? '' : 'space-y-2'}>
      {dropzone}
      {error && (
        <p
          className={isTile ? 'mt-1 text-[10px] font-medium leading-tight' : 'text-xs font-medium'}
          style={{ color: '#FCA5A5' }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
