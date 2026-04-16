'use client'

import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  min?: number
  max: number
  onChange: (next: number) => void
  label?: string
}

export default function QuantitySelector({
  value,
  min = 1,
  max,
  onChange,
  label = 'Cantidad',
}: QuantitySelectorProps) {
  const canDec = value > min
  const canInc = value < max

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-ink">{label}:</span>
      <div
        className="flex items-center overflow-hidden rounded-full"
        style={{ border: '1px solid rgba(0,0,0,0.12)' }}
      >
        <button
          type="button"
          onClick={() => canDec && onChange(value - 1)}
          disabled={!canDec}
          aria-label="Disminuir cantidad"
          className="flex h-10 w-10 items-center justify-center text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        </button>
        <span
          className="min-w-[2.5rem] text-center text-sm font-bold text-ink-strong"
          aria-live="polite"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => canInc && onChange(value + 1)}
          disabled={!canInc}
          aria-label="Aumentar cantidad"
          className="flex h-10 w-10 items-center justify-center text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>
      {max <= 5 && (
        <span className="text-xs text-ink-light">(máx. {max} en stock)</span>
      )}
    </div>
  )
}
