'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CategoryFilter, { type FilterValue } from './CategoryFilter'
import ProductCard from './ProductCard'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<FilterValue>('Todos')

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
      className="relative bg-[color:var(--bg-base)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mb-10 flex flex-col items-start gap-6 md:mb-14">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[color:var(--text-body)]">
              Catálogo
            </p>
            <h2
              id="products-heading"
              className="mt-3 font-display text-4xl font-extrabold leading-[1] tracking-[-0.02em] text-[color:var(--text-strong)] sm:text-5xl lg:text-6xl"
            >
              Escoge tu próximo{' '}
              <span style={{ fontWeight: 300, fontStyle: 'italic' }}>
                favorito.
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-base text-[color:var(--text-body)]">
              Accesorios de múltiples marcas, seleccionados para calidad y
              durabilidad. Elige el tuyo y lo tenemos listo para enviarte.
            </p>
          </div>
          <div className="w-full">
            <CategoryFilter
              active={activeCategory}
              onChange={setActiveCategory}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[color:var(--border-base)] bg-[color:var(--bg-surface)] py-24 text-center">
            <p className="mb-4 text-4xl">📦</p>
            <p className="mb-1 text-lg font-bold text-[color:var(--text-strong)]">
              Sin productos en esta categoría
            </p>
            <p className="text-sm text-[color:var(--text-body)]">
              Revisa pronto, estamos cargando más.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="md:hidden">
                <div
                  className="scroll-snap-x -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4"
                  aria-live="polite"
                >
                  {filtered.map((product) => (
                    <div
                      key={product.id}
                      className="scroll-snap-start flex-shrink-0"
                      style={{ width: '72vw', maxWidth: '320px' }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="hidden md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
                aria-live="polite"
              >
                {filtered.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  )
}
