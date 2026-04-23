import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import ProductGrid from '@/components/home/ProductGrid'
import TrustSection from '@/components/home/TrustSection'
import Testimonials from '@/components/home/Testimonials'
import ContactSection from '@/components/home/ContactSection'
import { getAllProducts } from '@/lib/products'
import { SITE } from '@/data/site'
import { SITE_NAME, SITE_DESCRIPTION, PRODUCTS_REVALIDATE_SECONDS } from '@/lib/constants'

export const revalidate = PRODUCTS_REVALIDATE_SECONDS

export const metadata: Metadata = {
  title: `${SITE_NAME} — Accesorios tecnológicos con domicilio gratis en ${SITE.city}`,
  description: SITE_DESCRIPTION,
}

export default async function HomePage() {
  const products = await getAllProducts()

  return (
    <>
      <Hero />
      <TrustSection />
      <ProductGrid products={products} />
      <Testimonials />
      <ContactSection />
    </>
  )
}
