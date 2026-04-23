'use client'

import { motion } from 'framer-motion'
import { HandCoins, ShieldCheck, Truck } from 'lucide-react'
import { SITE } from '@/data/site'

const PILLARS = [
  {
    icon: HandCoins,
    title: `Pago contra entrega en ${SITE.city}`,
    description:
      'Recibe tu producto primero, paga después. Cero riesgo para clientes en la ciudad.',
  },
  {
    icon: Truck,
    title: `Domicilio gratis en ${SITE.city}`,
    description:
      'Te lo llevamos a tu casa sin costo adicional. Rápido y sin preocupaciones.',
  },
  {
    icon: ShieldCheck,
    title: `Garantía de ${SITE.warrantyMonths} meses`,
    description:
      'Todos nuestros productos tienen respaldo real. Si algo falla, te respondemos.',
  },
]

export default function TrustSection() {
  return (
    <section className="bg-[color:var(--bg-base)]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[color:var(--text-body)]">
            ¿Por qué elegirnos?
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1] tracking-[-0.02em] text-[color:var(--text-strong)] sm:text-5xl lg:text-6xl">
            Compra sin riesgo,{' '}
            <span style={{ fontWeight: 300, fontStyle: 'italic' }}>
              recibe sin demora.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                delay: i * 0.12,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group flex flex-col gap-5 rounded-3xl p-7 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-1.5"
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(10,10,10,0.06) 0%, rgba(10,10,10,0.02) 100%)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <pillar.icon
                  className="h-6 w-6 text-[color:var(--text-primary)]"
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-display text-xl font-extrabold leading-snug text-[color:var(--text-strong)]">
                {pillar.title}
              </h3>
              <p className="text-sm leading-relaxed text-[color:var(--text-body)]">
                {pillar.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
