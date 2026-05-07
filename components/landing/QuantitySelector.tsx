'use client'

import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
}

/**
 * Selector +/- compacto. Toca-blanco grande (44px) para móvil.
 */
export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
}: QuantitySelectorProps) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))

  const dim = size === 'sm' ? 'h-10 w-10' : 'h-12 w-12'
  const txt = size === 'sm' ? 'min-w-[2.5rem] text-base' : 'min-w-[3rem] text-lg'

  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-white"
      role="group"
      aria-label="Cantidad"
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Disminuir cantidad"
        className={`${dim} flex items-center justify-center rounded-full text-ink-strong transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <Minus className="h-4 w-4" strokeWidth={2.4} />
      </button>
      <span
        aria-live="polite"
        className={`${txt} text-center font-bold tabular-nums text-ink-strong`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="Aumentar cantidad"
        className={`${dim} flex items-center justify-center rounded-full text-ink-strong transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <Plus className="h-4 w-4" strokeWidth={2.4} />
      </button>
    </div>
  )
}
