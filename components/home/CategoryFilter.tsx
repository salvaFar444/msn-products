'use client'

import { motion } from 'framer-motion'
import { CATEGORIES, type CategoryId } from '@/data/categories'

export type FilterValue = CategoryId

interface CategoryFilterProps {
  active: FilterValue
  onChange: (value: FilterValue) => void
}

export default function CategoryFilter({
  active,
  onChange,
}: CategoryFilterProps) {
  return (
    <div
      className="tabs-container -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0 md:pb-0"
      role="group"
      aria-label="Filtrar por categoría"
      style={{
        scrollbarWidth: 'none',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)',
        maskImage:
          'linear-gradient(to right, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)',
      }}
    >
      {CATEGORIES.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-pressed={isActive}
            aria-label={label}
            title={label}
            className="category-tab relative inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border-[1.5px] text-sm font-semibold transition-colors duration-200 active:scale-[0.96]"
            style={{
              color: isActive ? 'var(--text-inverted)' : 'var(--text-body)',
              borderColor: isActive
                ? 'var(--text-primary)'
                : 'var(--border-base)',
              background: isActive ? 'transparent' : 'var(--bg-base)',
              padding: '10px 16px',
            }}
          >
            {isActive && (
              <motion.span
                layoutId="activeCategoryPill"
                className="absolute inset-0 rounded-full bg-[color:var(--text-primary)]"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              <Icon
                className="h-4 w-4 flex-shrink-0"
                aria-hidden="true"
                strokeWidth={2.2}
              />
              <span className="tab-label">{label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
