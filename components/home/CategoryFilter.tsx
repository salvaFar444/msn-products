'use client'

import type { ProductCategory } from '@/types'

export type FilterValue = ProductCategory | 'Todos'

interface CategoryFilterProps {
  categories: FilterValue[]
  active: FilterValue
  onChange: (value: FilterValue) => void
}

export default function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
      {categories.map((cat) => {
        const isActive = active === cat
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            aria-pressed={isActive}
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.97]"
            style={
              isActive
                ? {
                    backgroundColor: '#FFFFFF',
                    color: '#0A0A0A',
                    border: '1px solid transparent',
                  }
                : {
                    backgroundColor: 'transparent',
                    color: '#888888',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }
            }
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.color = '#888888'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)'
              }
            }}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
