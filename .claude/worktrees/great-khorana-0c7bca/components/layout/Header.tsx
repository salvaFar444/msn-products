'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Instagram, Menu, X } from 'lucide-react'
import CartButton from '@/components/cart/CartButton'
import { SITE, WHATSAPP_URL } from '@/data/site'

// Brand WhatsApp glyph (green circle)
const WhatsAppGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header
      className={`fixed top-9 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-white border-b border-border/60'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5"
          aria-label={`${SITE.name} — inicio`}
        >
          <span className="font-display text-2xl font-extrabold tracking-tight text-ink-strong sm:text-2xl">
            MSN
          </span>
          <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-ink-light hidden sm:inline">
            Products
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Navegación principal"
        >
          <a
            href="#products"
            className="text-sm font-semibold text-ink-light hover:text-ink-strong transition-colors duration-200"
          >
            Productos
          </a>
          <a
            href="#contact"
            className="text-sm font-semibold text-ink-light hover:text-ink-strong transition-colors duration-200"
          >
            Contacto
          </a>
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Instagram */}
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram @${SITE.instagram}`}
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-light hover:bg-surface hover:text-ink-strong transition-colors"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" />
          </a>

          {/* WhatsApp CTA */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-whatsapp hover:bg-whatsapp-hover px-4 py-2 text-xs font-bold text-white transition-colors active:scale-[0.97]"
          >
            <WhatsAppGlyph />
            WhatsApp
          </a>

          <CartButton />

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-full border border-border text-ink-strong transition-colors"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden bg-white transition-all duration-300 ease-out ${
          menuOpen ? 'max-h-80 border-t border-border' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 pb-5 pt-3">
          <a
            href="#products"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-3 py-3 text-sm font-semibold text-ink hover:bg-surface transition-colors"
          >
            Productos
          </a>
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-3 py-3 text-sm font-semibold text-ink hover:bg-surface transition-colors"
          >
            Contacto
          </a>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-ink hover:bg-surface transition-colors"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" />
            Instagram · @{SITE.instagram}
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-whatsapp hover:bg-whatsapp-hover px-4 py-3 text-sm font-bold text-white"
          >
            <WhatsAppGlyph />
            Pedir por WhatsApp
          </a>
        </nav>
      </div>
    </header>
  )
}
