'use client'

import { useState, useMemo } from 'react'
import CategoryFilter, { type FilterValue } from './CategoryFilter'
import ProductCard from './ProductCard'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<FilterValue>('Todos')

  const categories = useMemo<FilterValue[]>(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)))
    return ['Todos', ...cats] as FilterValue[]
  }, [products])

  const filtered = useMemo(
    () =>
      activeCategory === 'Todos'
        ? products
        : products.filter((p) => p.category === activeCategory),
    [products, activeCategory]
  )

  return (
    <section
      id="products"
      aria-labelledby="products-heading"
      className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* Section header */}
      <div className="mb-12">
        <p
          className="mb-3 text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: '#C9A84C' }}
        >
          Catálogo
        </p>
        <h2
          id="products-heading"
          className="mb-8 text-3xl font-bold text-white sm:text-5xl"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif', lineHeight: 1.1 }}
        >
          Escoge tu próximo favorito
        </h2>
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-lg font-semibold text-white mb-1">Sin productos en esta categoría</p>
          <p className="text-sm" style={{ color: '#888888' }}>Revisa pronto, estamos cargando más.</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
          aria-live="polite"
          aria-atomic="false"
        >
          {filtered.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-up opacity-0"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'forwards',
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
