'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import AnnouncementBar from './AnnouncementBar'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'

export default function PublicLayoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

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
