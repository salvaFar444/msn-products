'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MediaList from './MediaList'
import type { Product, ProductFormData, ProductCategory, ProductMedia } from '@/types'

// Format an ISO timestamp (or undefined) into a human-readable
// "16 abr 2026, 10:14 a. m." style string in Colombia timezone.
function formatUpdatedAt(iso: string | undefined): string | null {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return null
  }
}

// Build the initial ProductFormData from a Product (or blank).
// Extracted so useEffect can re-sync when the incoming product changes.
function buildInitialForm(product?: Product): ProductFormData {
  return {
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
    media: product?.media ?? [],
  }
}

// Pick the URL that should be cached in products.image_url so the home
// and catalog cards render the right thumbnail. Preference order:
// 1) media flagged primary + image, 2) first image, 3) legacy imageUrl.
function pickPrimaryImageUrl(media: ProductMedia[] | undefined, fallback?: string): string {
  if (media && media.length > 0) {
    const primary = media.find((m) => m.isPrimary && m.mediaType === 'image')
    if (primary) return primary.url
    const firstImage = media.find((m) => m.mediaType === 'image')
    if (firstImage) return firstImage.url
  }
  return fallback ?? '/img.jpg'
}

const CATEGORIES: ProductCategory[] = ['Audio', 'Wearables', 'Cables', 'Cargadores']

interface ProductFormProps {
  product?: Product
  onSubmit: (data: ProductFormData) => Promise<{ success: boolean; error?: string }>
}

// Stable upload path per form instance: use product id when editing, or a
// pre-generated UUID when creating. This UUID is what MediaList uses as the
// Storage folder prefix before the product row exists in the DB.
function useUploadPath(productId?: string) {
  const [id] = useState(() => productId ?? crypto.randomUUID())
  return id
}

export default function ProductForm({ product, onSubmit }: ProductFormProps) {
  const router = useRouter()
  const uploadPath = useUploadPath(product?.id)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const [form, setForm] = useState<ProductFormData>(() => buildInitialForm(product))

  // Re-sync local state when the incoming product identity changes. Without
  // this, navigating from /admin/products/A/edit to /admin/products/B/edit
  // would keep stale form values because useState initializers only run once.
  useEffect(() => {
    setForm(buildInitialForm(product))
    setServerError(null)
    setSaved(false)
  }, [product?.id])

  const setField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const updatedAtLabel = formatUpdatedAt(product?.updatedAt)

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
    setSaved(false)

    try {
      const cleanedFeatures = form.features.filter((f) => f.trim() !== '')

      // When creating a new product, require at least one image so the
      // storefront card doesn't fall back to the placeholder.
      if (!product && (!form.media || form.media.filter((m) => m.mediaType === 'image').length === 0)) {
        setServerError('Sube al menos una imagen antes de crear el producto.')
        setLoading(false)
        return
      }

      // The primary image goes into products.image_url so the catalog
      // cards render the right thumbnail without having to JOIN product_media.
      const resolvedImageUrl = pickPrimaryImageUrl(form.media, form.imageUrl)

      const payload: ProductFormData = {
        ...form,
        features: cleanedFeatures,
        imageFile: undefined,       // never send File to server action
        imageUrl: resolvedImageUrl,
        media: form.media,
      }

      // NOTE: `await onSubmit(payload)` only resolves AFTER the server action
      // completes — i.e., after the Supabase INSERT/UPDATE returns. We never
      // call router.push before this line, so there is no "premature redirect"
      // path. If the action throws, we land in the catch block below and show
      // serverError instead of navigating.
      const result = await onSubmit(payload)

      if (result.success) {
        // Visual + console confirmation BEFORE navigation so the admin can
        // actually see "Guardado" and confirm the update happened.
        console.log('[ADMIN] Product updated:', {
          id: product?.id,
          name: payload.name,
          price: payload.price,
          stock: payload.stock,
          at: new Date().toISOString(),
        })
        setSaved(true)
        setLoading(false)
        // Give the admin ~1.4s to read the banner, then navigate.
        setTimeout(() => {
          router.push('/admin/products')
          router.refresh()
        }, 1400)
        return
      } else {
        setServerError(result.error ?? 'Error desconocido al guardar.')
      }
    } catch (err) {
      console.error('[ProductForm] handleSubmit error:', err)
      setServerError('Error inesperado. Verifica tu conexión e intenta de nuevo.')
    } finally {
      // Only clear loading on the error path — the success path handled it
      // before setTimeout so the button doesn't spin during the 1.4s delay.
      if (!saved) setLoading(false)
    }
  }

  // Admin palette (matches login, sidebar and dashboard):
  //   bg       #1A1A1A
  //   border   rgba(255,255,255,0.1)
  //   text     #FFFFFF
  //   focus    #E87A00
  const inputClass =
    'w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#E87A00] focus:ring-2 focus:ring-[#E87A00]/20'
  const labelClass = 'mb-1.5 block text-sm font-medium text-white'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saved && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{
            backgroundColor: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.35)',
            color: '#86EFAC',
          }}
          role="status"
          aria-live="polite"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-4 w-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span>
            {product ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.'} Redirigiendo…
          </span>
        </div>
      )}

      {serverError && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            backgroundColor: 'rgba(220,38,38,0.1)',
            border: '1px solid rgba(220,38,38,0.3)',
            color: '#FCA5A5',
          }}
          role="alert"
        >
          {serverError}
        </div>
      )}

      {updatedAtLabel && (
        <p className="-mt-2 text-xs text-white/45">
          Última actualización: <span className="text-white/70">{updatedAtLabel}</span>
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-5">
          <div>
            <label htmlFor="name" className={labelClass}>
              Nombre completo<span className="text-danger ml-0.5">*</span>
            </label>
            <input id="name" type="text" required value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Audífonos Inalámbricos Pro" className={inputClass} />
          </div>

          <div>
            <label htmlFor="shortName" className={labelClass}>
              Nombre corto<span className="text-danger ml-0.5">*</span>
            </label>
            <input id="shortName" type="text" required value={form.shortName} onChange={(e) => setField('shortName', e.target.value)} placeholder="Audífonos Pro" className={inputClass} />
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
          {product ? (
            // Edit mode: gallery commits changes to the DB immediately.
            <MediaList
              productId={product.id}
              initial={product.media ?? []}
              mode="commit"
            />
          ) : (
            // New mode: gallery runs in "draft" — uploads to Storage happen
            // right away, but product_media rows only get inserted after the
            // product row is created. uploadPath is a pre-generated UUID
            // that becomes the new product's id on submit.
            <MediaList
              productId={uploadPath}
              initial={form.media ?? []}
              mode="draft"
              onChange={(list) => setField('media', list)}
            />
          )}

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
                    className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-white/10 bg-[#1A1A1A] text-white/60 transition-colors hover:border-red-500/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
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
                className="flex items-center gap-2 text-sm font-semibold text-[#E87A00] transition-colors hover:text-[#C96700]"
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
      <div
        className="flex gap-3 pt-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading || saved}
          className="rounded-xl border border-white/10 bg-[#1A1A1A] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || saved}
          className="flex items-center gap-2 rounded-xl bg-[#E87A00] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#C96700] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ boxShadow: '0 10px 28px rgba(232,122,0,0.28)' }}
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {saved
            ? 'Guardado ✓'
            : loading
              ? 'Guardando...'
              : product
                ? 'Actualizar producto'
                : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
