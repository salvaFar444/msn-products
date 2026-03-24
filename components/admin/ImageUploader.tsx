'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/lib/constants'

interface ImageUploaderProps {
  currentUrl?: string
  onChange: (file: File | null) => void
}

export default function ImageUploader({ currentUrl, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const processFile = (file: File) => {
    setError(null)

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WebP.')
      return
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setError(`El archivo no puede superar ${MAX_IMAGE_SIZE_MB}MB.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    onChange(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const displayUrl = preview ?? currentUrl

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">Imagen del producto</label>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? 'border-accent bg-accent-muted'
            : 'border-border hover:border-border-strong hover:bg-white/3'
        }`}
        role="button"
        tabIndex={0}
        aria-label="Subir imagen de producto"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        {displayUrl ? (
          <div className="relative h-32 w-32">
            <Image
              src={displayUrl}
              alt="Vista previa"
              fill
              sizes="128px"
              className="rounded-xl object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-10 w-10"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            <p className="text-sm">
              <span className="font-medium text-accent">Haz clic</span> o arrastra aquí
            </p>
            <p className="text-xs">JPG, PNG, WebP — Máx. {MAX_IMAGE_SIZE_MB}MB</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          onChange={handleInputChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {displayUrl && (
        <button
          type="button"
          onClick={() => {
            setPreview(null)
            onChange(null)
          }}
          className="text-xs text-muted hover:text-danger transition-colors"
        >
          Quitar imagen
        </button>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
