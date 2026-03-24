'use client'

import { usePathname } from 'next/navigation'
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

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </>
  )
}
