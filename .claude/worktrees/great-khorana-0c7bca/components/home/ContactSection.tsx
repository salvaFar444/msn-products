'use client'

import { Instagram, MapPin } from 'lucide-react'
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

export default function ContactSection() {
  return (
    <section id="contact" className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-surface p-8 sm:p-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
            {/* Copy */}
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink-light">
                Contáctanos
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-ink-strong sm:text-4xl">
                Escríbenos por WhatsApp y te atendemos al instante.
              </h2>
              <p className="mt-4 text-base text-ink-light">
                Tenemos atención directa, sin filas ni formularios complicados.
                Resolvemos tus dudas antes de comprar y te guiamos con tu pedido
                paso a paso.
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-ink-light">
                <MapPin className="h-4 w-4 text-ink" aria-hidden="true" />
                <span>
                  {SITE.city}, {SITE.department} — {SITE.country}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 rounded-2xl bg-whatsapp hover:bg-whatsapp-hover px-6 py-5 text-white transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                    <WhatsAppGlyph />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-90">
                      WhatsApp
                    </p>
                    <p className="text-lg font-extrabold">
                      {SITE.whatsappDisplay}
                    </p>
                  </div>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>

              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-white px-6 py-5 text-ink-strong transition-all hover:border-ink hover:shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div className="chip-glass flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-ink">
                    <Instagram
                      className="h-5 w-5"
                      aria-hidden="true"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink-light">
                      Instagram
                    </p>
                    <p className="text-lg font-extrabold">
                      @{SITE.instagram}
                    </p>
                  </div>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
