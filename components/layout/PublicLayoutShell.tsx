'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import AnnouncementBar from './AnnouncementBar'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import LandingHeader from '@/components/landing/LandingHeader'

export default function PublicLayoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  // Landing one-product en la home — usa header/footer propios y no
  // muestra carrito drawer ni botón flotante de WhatsApp (un solo
  // CTA de conversión = comprar).
  const isLanding = pathname === '/'

  // Toggle the `.admin-dark` scope class on <html> so the dark
  // theme only applies to admin routes.
  useEffect(() => {
    const root = document.documentElement
    if (isAdmin) {
      root.classList.add('admin-dark')
    } else {
      root.classList.remove('admin-dark')
    }
  }, [isAdmin])

  if (isAdmin) {
    return <>{children}</>
  }

  if (isLanding) {
    return (
      <>
        <AnnouncementBar />
        <LandingHeader />
        <main className="pt-[5.75rem] sm:pt-[6.25rem]">{children}</main>
        {/* El footer y el sticky bar viven dentro de LandingClient. */}
      </>
    )
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="pt-[6.25rem]">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </>
  )
}
