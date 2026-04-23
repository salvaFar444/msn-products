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
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink-light">
            ¿Por qué elegirnos?
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Compra sin riesgo, recibe sin demora
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                delay: i * 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="card card-hover flex flex-col gap-4 p-7"
            >
              <div className="chip-glass flex h-14 w-14 items-center justify-center rounded-2xl text-ink">
                <pillar.icon className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="text-xl font-extrabold text-ink-strong">
                {pillar.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-light">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
