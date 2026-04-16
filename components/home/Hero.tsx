'use client'

import { motion } from 'framer-motion'
import { ArrowDown, MapPin, ShieldCheck, Star, Wallet } from 'lucide-react'
import { SITE, WHATSAPP_URL } from '@/data/site'

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
  { icon: Wallet, label: `Pago contra entrega en ${SITE.city}` },
  {
    icon: ShieldCheck,
    label: `Garantía de ${SITE.warrantyMonths} meses`,
  },
  { icon: Star, label: 'Atención directa por WhatsApp' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 * i,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Very subtle accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(232,122,0,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 pt-20 pb-20 text-center sm:px-8 sm:pt-24 sm:pb-28">
        {/* Eyebrow pill */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-4 py-1.5"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-accent-hover">
            {SITE.city}, {SITE.department}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="mt-8 font-display font-extrabold leading-[1.05] tracking-tight text-ink-strong"
          style={{ fontSize: 'clamp(2.6rem, 7.5vw, 5.5rem)' }}
        >
          Tecnología que llega
          <br />
          <span className="text-accent">a tu puerta.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-ink-light sm:text-lg"
        >
          Accesorios tecnológicos en {SITE.city} con domicilio gratis y pago
          contra entrega. Paga solo cuando recibas tu pedido. Garantía de{' '}
          {SITE.warrantyMonths} meses en todos nuestros productos.
          <br className="hidden sm:block" />
          <span className="text-ink-muted">
            ¿Vives fuera de {SITE.city}? Escríbenos por WhatsApp y coordinamos
            envío.
          </span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <a
            href="#products"
            className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold tracking-wide uppercase active:scale-[0.97] sm:w-auto"
          >
            Ver productos
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp hover:bg-whatsapp-hover px-8 py-4 text-sm font-bold tracking-wide uppercase text-white transition-colors active:scale-[0.97] sm:w-auto"
          >
            <WhatsAppGlyph />
            Pedir por WhatsApp
          </a>
        </motion.div>

        {/* Badges */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-12 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:gap-y-3"
        >
          {BADGES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 shadow-card sm:border-0 sm:bg-transparent sm:shadow-none"
            >
              <Icon
                className="h-4 w-4 flex-shrink-0 text-accent"
                aria-hidden="true"
                strokeWidth={2.2}
              />
              <span className="text-xs font-semibold text-ink sm:text-sm">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
