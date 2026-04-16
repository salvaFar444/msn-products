import ProductCard from '@/components/home/ProductCard'
import type { Product } from '@/types'

interface RelatedProductsProps {
  products: Product[]
  heading?: string
}

export default function RelatedProducts({
  products,
  heading = 'Quizás también te interese',
}: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-extrabold text-ink-strong">{heading}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
