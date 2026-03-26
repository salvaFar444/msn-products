'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import CartButton from '@/components/cart/CartButton'
import { WHATSAPP_URL } from '@/lib/constants'

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
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

  // Close menu on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header
        className={`fixed top-8 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-[#0A0A0A]/90 backdrop-blur-[20px] border-b border-white/[0.07]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1"
            aria-label="MSN Products — inicio"
          >
            <span
              className="font-serif text-xl font-bold tracking-tight text-white sm:text-2xl"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              MSN
            </span>
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-white/40 ml-1 hidden sm:inline">
              Products
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Principal">
            <a
              href="#products"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200 tracking-wide"
            >
              Productos
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200 tracking-wide"
            >
              Contacto
            </a>
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* WhatsApp CTA — desktop */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
              style={{ backgroundColor: '#25D366' }}
            >
              {WA_ICON}
              WhatsApp
            </a>
            <CartButton />

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{ background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)' }}
        >
          <nav className="flex flex-col gap-1 px-4 pb-5 pt-2 border-t border-white/[0.07]">
            <a
              href="#products"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              Productos
            </a>
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              Contacto
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white justify-center"
              style={{ backgroundColor: '#25D366' }}
            >
              {WA_ICON}
              Pedir por WhatsApp
            </a>
          </nav>
        </div>
      </header>
    </>
  )
}
