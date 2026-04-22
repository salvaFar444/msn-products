'use client'

import { useState } from 'react'
import { Tag, X, Loader2, Check } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { validateDiscountViaApi } from '@/lib/discounts'

export default function DiscountInput() {
  const { discount, subtotal, applyDiscount, removeDiscount } = useCart()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  const handleApply = async () => {
    if (!code.trim() || loading) return
    setLoading(true)
    setError(null)
    setHint(null)
    const result = await validateDiscountViaApi(code, subtotal)
    setLoading(false)
    if (result.ok) {
      applyDiscount(result.discount)
      setCode('')
    } else {
      setError(result.error)
      setHint(result.hint ?? null)
    }
  }

  const handleRemove = () => {
    removeDiscount()
    setError(null)
    setHint(null)
  }

  if (discount) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-ink/15 bg-white px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-ink" strokeWidth={2.5} aria-hidden="true" />
          <span className="font-bold text-ink-strong">{discount.code}</span>
          <span className="text-xs text-ink-light">
            {discount.discountType === 'percentage'
              ? `−${discount.discountValue}%`
              : 'descuento fijo'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Quitar cupón"
          className="flex h-7 w-7 items-center justify-center rounded-full text-ink-light transition-colors hover:bg-surface hover:text-ink-strong"
        >
          <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <Tag
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light"
            strokeWidth={2}
            aria-hidden="true"
          />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError(null)
              setHint(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleApply()
              }
            }}
            placeholder="Código de descuento"
            className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm font-medium uppercase tracking-wider text-ink-strong placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-muted outline-none focus:border-ink"
            aria-label="Código de descuento"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
        </button>
      </div>
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
      {hint && <p className="text-xs text-ink-light">{hint}</p>}
    </div>
  )
}
