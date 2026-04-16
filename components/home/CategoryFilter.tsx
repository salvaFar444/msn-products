'use client'

import type { ProductCategory } from '@/types'

export type FilterValue = ProductCategory | 'Todos'

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
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filtrar por categoría"
    >
      {categories.map((cat) => {
        const isActive = active === cat
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            aria-pressed={isActive}
            className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 active:scale-[0.97] ${
              isActive
                ? 'bg-primary text-white border border-primary'
                : 'bg-white text-ink-light border border-border hover:border-ink hover:text-ink-strong'
            }`}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
