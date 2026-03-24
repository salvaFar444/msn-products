'use client'

import { cn } from '@/lib/utils'
import type { ProductCategory } from '@/types'

export type FilterValue = ProductCategory | 'Todos'

const CATEGORY_ICONS: Record<FilterValue, string> = {
  Todos: '✦',
  Audio: '🎧',
  Wearables: '⌚',
  Cables: '🔌',
  Cargadores: '⚡',
}

interface CategoryFilterProps {
  categories: FilterValue[]
  active: FilterValue
  onChange: (value: FilterValue) => void
}

export default function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          aria-pressed={active === cat}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
            active === cat
              ? 'bg-accent text-white shadow-lg shadow-accent/20'
              : 'border border-border bg-surface text-muted hover:border-border-strong hover:text-white'
          )}
        >
          <span aria-hidden="true">{CATEGORY_ICONS[cat]}</span>
          {cat}
        </button>
      ))}
    </div>
  )
}
