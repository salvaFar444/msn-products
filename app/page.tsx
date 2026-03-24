import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import ProductGrid from '@/components/home/ProductGrid'
import { getAllProducts } from '@/lib/products'
import { SITE_NAME, SITE_DESCRIPTION, PRODUCTS_REVALIDATE_SECONDS } from '@/lib/constants'

export const revalidate = PRODUCTS_REVALIDATE_SECONDS

export const metadata: Metadata = {
  title: `${SITE_NAME} — Accesorios Apple al mejor precio en Colombia`,
  description: SITE_DESCRIPTION,
}

export default async function HomePage() {
  const products = await getAllProducts()

  return (
    <>
      <Hero />
      <ProductGrid products={products} />
    </>
  )
}
