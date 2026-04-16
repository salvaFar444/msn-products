'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { REVIEWS } from '@/data/reviews'
import { SITE } from '@/data/site'

export default function Testimonials() {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-10 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
            Reseñas
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-ink-strong sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-3 text-sm font-medium text-ink-light">
            {SITE.happyCustomersLabel} satisfechos en {SITE.city} y la región
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="card flex flex-col gap-4 p-6"
            >
              {/* Stars */}
              <div
                className="flex gap-0.5"
                aria-label={`${review.stars} de 5 estrellas`}
              >
                {Array.from({ length: review.stars }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="h-4 w-4 fill-accent text-accent"
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="flex-1 text-base leading-relaxed text-ink">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-border pt-4">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-extrabold text-accent"
                  aria-hidden="true"
                >
                  {review.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-strong">
                    {review.name}
                  </p>
                  <p className="text-xs font-medium text-ink-light">
                    {review.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
