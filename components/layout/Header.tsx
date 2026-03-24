'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import CartButton from '@/components/cart/CartButton'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-9 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border bg-background/90 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — shrink-0 prevents compression on narrow screens */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1 font-bold tracking-tight"
        >
          <span className="text-gradient-accent text-base sm:text-lg">MSN</span>
          <span className="text-primary text-base sm:text-lg">Products</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Principal">
          <a
            href="#products"
            className="text-sm text-muted hover:text-primary transition-colors duration-200"
          >
            Productos
          </a>
          <a
            href="#contact"
            className="text-sm text-muted hover:text-primary transition-colors duration-200"
          >
            Contacto
          </a>
        </nav>

        {/* Actions — shrink-0 keeps cart button always visible */}
        <div className="flex shrink-0 items-center">
          <CartButton />
        </div>
      </div>
    </header>
  )
}
