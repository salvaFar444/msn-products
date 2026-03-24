'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from './ImageUploader'
import type { Product, ProductFormData, ProductCategory } from '@/types'

const CATEGORIES: ProductCategory[] = ['Audio', 'Wearables', 'Cables', 'Cargadores']

interface ProductFormProps {
  product?: Product
  onSubmit: (data: ProductFormData) => Promise<{ success: boolean; error?: string }>
}

// Stable upload path per form instance: use product id when editing, new UUID when creating
function useUploadPath(productId?: string) {
  const [id] = useState(() => productId ?? crypto.randomUUID())
  return id
}

async function uploadImageToStorage(file: File, uploadPath: string): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const fd = new FormData()
  fd.append('file', file)
  fd.append('path', `${uploadPath}.${ext}`)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
  if (!res.ok) return null
  const json = await res.json() as { url?: string }
  return json.url ?? null
}

export default function ProductForm({ product, onSubmit }: ProductFormProps) {
  const router = useRouter()
  const uploadPath = useUploadPath(product?.id)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const [form, setForm] = useState<ProductFormData>({
    name: product?.name ?? '',
    shortName: product?.shortName ?? '',
    category: product?.category ?? 'Audio',
    price: product?.price ?? 0,
    description: product?.description ?? '',
    stock: product?.stock ?? 0,
    badge: product?.badge ?? '',
    features: product?.features ?? [''],
    imageUrl: product?.image,
    imageFile: undefined,
  })

  const setField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const updateFeature = (index: number, value: string) => {
    const updated = [...form.features]
    updated[index] = value
    setField('features', updated)
  }

  const addFeature = () => setField('features', [...form.features, ''])
  const removeFeature = (index: number) =>
    setField('features', form.features.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setServerError(null)

    try {
      const cleanedFeatures = form.features.filter((f) => f.trim() !== '')

      // Upload image client-side first — File objects can't cross the server action boundary
      let resolvedImageUrl = form.imageUrl
      if (form.imageFile) {
        const uploaded = await uploadImageToStorage(form.imageFile, uploadPath)
        if (!uploaded) {
          setServerError('Error al subir la imagen. Intenta de nuevo.')
          return
        }
        resolvedImageUrl = uploaded
      }

      const result = await onSubmit({
        ...form,
        features: cleanedFeatures,
        imageFile: undefined,       // never send File to server action
        imageUrl: resolvedImageUrl,
      })

      if (result.success) {
        router.push('/admin/products')
        router.refresh()
      } else {
        setServerError(result.error ?? 'Error desconocido al guardar.')
      }
    } catch (err) {
      console.error('[ProductForm] handleSubmit error:', err)
      setServerError('Error inesperado. Verifica tu conexión e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-white placeholder:text-muted-low outline-none transition-colors focus:border-accent'
  const labelClass = 'mb-1.5 block text-sm font-medium text-white'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-5">
          <div>
            <label htmlFor="name" className={labelClass}>
              Nombre completo<span className="text-danger ml-0.5">*</span>
            </label>
            <input id="name" type="text" required value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="AirPods PRO 2da gen" className={inputClass} />
          </div>

          <div>
            <label htmlFor="shortName" className={labelClass}>
              Nombre corto<span className="text-danger ml-0.5">*</span>
            </label>
            <input id="shortName" type="text" required value={form.shortName} onChange={(e) => setField('shortName', e.target.value)} placeholder="AirPods Pro 2" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className={labelClass}>
                Categoría<span className="text-danger ml-0.5">*</span>
              </label>
              <select
                id="category"
                required
                value={form.category}
                onChange={(e) => setField('category', e.target.value as ProductCategory)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className={labelClass}>
                Precio (COP)<span className="text-danger ml-0.5">*</span>
              </label>
              <input
                id="price"
                type="number"
                required
                min="1"
                value={form.price}
                onChange={(e) => setField('price', parseInt(e.target.value, 10) || 0)}
                placeholder="65000"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="stock" className={labelClass}>
                Stock<span className="text-danger ml-0.5">*</span>
              </label>
              <input
                id="stock"
                type="number"
                required
                min="0"
                value={form.stock}
                onChange={(e) => setField('stock', parseInt(e.target.value, 10) || 0)}
                placeholder="10"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="badge" className={labelClass}>
                Badge (opcional)
              </label>
              <input
                id="badge"
                type="text"
                value={form.badge}
                onChange={(e) => setField('badge', e.target.value)}
                placeholder="Más vendido"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Descripción<span className="text-danger ml-0.5">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={3}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Descripción técnica del producto..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <ImageUploader
            currentUrl={form.imageUrl}
            onChange={(file) => {
              setField('imageFile', file ?? undefined)
              if (!file) setField('imageUrl', undefined)
            }}
          />

          {/* Features */}
          <div>
            <label className={labelClass}>Características</label>
            <div className="space-y-2">
              {form.features.map((feature, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(i, e.target.value)}
                    placeholder={`Característica ${i + 1}`}
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    disabled={form.features.length === 1}
                    className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-border text-muted hover:border-danger/40 hover:text-danger transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Eliminar característica"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Agregar característica
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t border-white/5 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? 'Guardando...' : product ? 'Actualizar producto' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
