'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SITE } from '@/data/site'

/**
 * Header simplificado para el landing one-product.
 * Solo: Logo MSN. Sin nav, sin botón de WhatsApp ni carrito flotante —
 * el flujo de conversión vive en el body del landing.
 */
export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed left-0 right-0 top-9 z-40 header-glass ${
        scrolled ? 'header-glass-scrolled' : ''
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-baseline gap-1.5"
          aria-label={`${SITE.name} — inicio`}
        >
          <span className="font-display text-2xl font-extrabold tracking-tight text-ink-strong">
            MSN
          </span>
          <span className="hidden text-[10px] font-bold uppercase tracking-[0.22em] text-ink-light sm:inline">
            Products
          </span>
        </Link>
      </div>
    </header>
  )
}
