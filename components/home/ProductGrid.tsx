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
      className="bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
            Catálogo
          </p>
          <h2
            id="products-heading"
            className="mt-3 text-3xl font-extrabold text-ink-strong sm:text-5xl"
          >
            Escoge tu próximo favorito
          </h2>
          <p className="mt-4 max-w-2xl text-base text-ink-light">
            Accesorios de múltiples marcas, seleccionados para calidad y
            durabilidad. Elige el tuyo y lo tenemos listo para enviarte.
          </p>
          <div className="mt-8">
            <CategoryFilter
              categories={categories}
              active={activeCategory}
              onChange={setActiveCategory}
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-24 text-center">
            <p className="mb-4 text-4xl">📦</p>
            <p className="mb-1 text-lg font-bold text-ink-strong">
              Sin productos en esta categoría
            </p>
            <p className="text-sm text-ink-light">
              Revisa pronto, estamos cargando más.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
      </div>
    </section>
  )
}
