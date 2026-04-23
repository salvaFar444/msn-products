'use client'

import { motion } from 'framer-motion'
import { ArrowDown, MapPin, ShieldCheck, Wallet } from 'lucide-react'
import { SITE, WHATSAPP_URL } from '@/data/site'
import HeroProduct from './HeroProduct'
import type { Product } from '@/types'

const WhatsAppGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const BADGES = [
  { icon: MapPin, label: `Domicilio gratis en ${SITE.city}` },
  { icon: Wallet, label: 'Pago contra entrega' },
  {
    icon: ShieldCheck,
    label: `Garantía ${SITE.warrantyMonths} meses`,
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 * i,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

interface HeroProps {
  featured: Product | null
}

export default function Hero({ featured }: HeroProps) {
  return (
    <section className="relative overflow-hidden hero-atmosphere">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-20 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(10,10,10,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-20 h-[560px] w-[560px] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(10,10,10,0.06) 0%, transparent 72%)',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 pt-16 pb-20 sm:px-8 sm:pt-20 sm:pb-28 lg:grid-cols-12 lg:gap-16 lg:pt-24">
        <div className="order-2 text-center lg:order-1 lg:col-span-6 lg:text-left">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="chip-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--text-primary)] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--text-primary)]" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--text-primary)]">
              {SITE.city}, {SITE.department}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-7 font-display leading-[0.98] tracking-[-0.02em] text-[color:var(--text-strong)]"
            style={{ fontSize: 'clamp(2.8rem, 7.4vw, 5.6rem)' }}
          >
            <span style={{ fontWeight: 800 }}>Tecnología que llega</span>
            <br />
            <span
              style={{
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'var(--text-body)',
              }}
            >
              a tu puerta.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-[color:var(--text-body)] sm:text-lg lg:mx-0"
          >
            Accesorios tecnológicos en {SITE.city} con domicilio gratis y pago
            contra entrega. Paga solo cuando recibas tu pedido. Garantía de{' '}
            {SITE.warrantyMonths} meses en todos nuestros productos.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <a
              href="#products"
              className="btn-solid-black inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide sm:w-auto"
            >
              Ver productos
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass-light inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide sm:w-auto"
            >
              <WhatsAppGlyph />
              Pedir por WhatsApp
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 lg:justify-start"
          >
            {BADGES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-[color:var(--text-body)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--text-primary)]/5">
                  <Icon
                    className="h-3.5 w-3.5 text-[color:var(--text-primary)]"
                    aria-hidden="true"
                    strokeWidth={2.4}
                  />
                </span>
                <span className="text-xs font-semibold sm:text-sm">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="order-1 pb-12 sm:pb-16 lg:order-2 lg:col-span-6 lg:pb-0">
          <HeroProduct product={featured} />
        </div>
      </div>
    </section>
  )
}
