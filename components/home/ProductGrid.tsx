'use client'

import { useState, useMemo } from 'react'
import CategoryFilter, { type FilterValue } from './CategoryFilter'
import ProductCard from './ProductCard'
import type { Product, ProductCategory } from '@/types'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<FilterValue>('Todos')

  // Derive unique categories from product data
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
      <div className="mb-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
          Catálogo
        </p>
        <h2
          id="products-heading"
          className="mb-6 text-3xl font-bold text-primary sm:text-4xl"
        >
          Nuestros productos
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
          <p className="text-4xl">📦</p>
          <p className="mt-4 text-lg font-medium text-primary">
            Sin productos en esta categoría
          </p>
          <p className="mt-1 text-sm text-muted">
            Revisa pronto, estamos cargando más.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-live="polite"
          aria-atomic="false"
        >
          {filtered.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-up opacity-0"
              style={{
                animationDelay: `${index * 60}ms`,
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
