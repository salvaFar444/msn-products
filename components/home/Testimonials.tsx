'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { REVIEWS } from '@/data/reviews'
import { SITE } from '@/data/site'

export default function Testimonials() {
  return (
    <section className="bg-[color:var(--bg-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mb-12 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[color:var(--text-body)]">
            Reseñas
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1] tracking-[-0.02em] text-[color:var(--text-strong)] sm:text-5xl">
            Lo que dicen{' '}
            <span style={{ fontWeight: 300, fontStyle: 'italic' }}>
              nuestros clientes.
            </span>
          </h2>
          <p className="mt-4 text-sm font-medium text-[color:var(--text-body)]">
            {SITE.happyCustomersLabel} satisfechos en {SITE.city} y la región
          </p>
        </div>

        <div className="md:hidden">
          <div className="scroll-snap-x -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
            {REVIEWS.map((review) => (
              <article
                key={review.name}
                className="scroll-snap-start flex flex-shrink-0 flex-col gap-4 rounded-3xl bg-white p-6"
                style={{
                  width: '80vw',
                  maxWidth: '340px',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div
                  className="flex gap-0.5"
                  aria-label={`${review.stars} de 5 estrellas`}
                >
                  {Array.from({ length: review.stars }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="h-4 w-4 fill-[color:var(--text-primary)] text-[color:var(--text-primary)]"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="flex-1 text-base leading-relaxed text-[color:var(--text-primary)]">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div
                  className="flex items-center gap-3 pt-4"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--text-primary)] text-sm font-extrabold text-white"
                    aria-hidden="true"
                  >
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[color:var(--text-strong)]">
                      {review.name}
                    </p>
                    <p className="text-xs font-medium text-[color:var(--text-body)]">
                      {review.location}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-3 md:gap-6">
          {REVIEWS.map((review, i) => (
            <motion.article
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-4 rounded-3xl bg-white p-7"
              style={{
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                className="flex gap-0.5"
                aria-label={`${review.stars} de 5 estrellas`}
              >
                {Array.from({ length: review.stars }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="h-4 w-4 fill-[color:var(--text-primary)] text-[color:var(--text-primary)]"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="flex-1 text-base leading-relaxed text-[color:var(--text-primary)]">
                &ldquo;{review.text}&rdquo;
              </p>
              <div
                className="flex items-center gap-3 pt-4"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--text-primary)] text-sm font-extrabold text-white"
                  aria-hidden="true"
                >
                  {review.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-[color:var(--text-strong)]">
                    {review.name}
                  </p>
                  <p className="text-xs font-medium text-[color:var(--text-body)]">
                    {review.location}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
