const PILLARS = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: 'Original Apple garantizado',
    description: 'Todos nuestros productos son 100% originales con certificado de autenticidad.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: 'Envío gratis a todo el país',
    description: 'Despacho rápido a todas las ciudades de Colombia, sin costo adicional.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    title: 'Pago 100% seguro',
    description: 'Acepta Nequi, PSE, tarjetas y más métodos de pago seguros.',
  },
]

export default function TrustSection() {
  return (
    <section className="relative">
      {/* Top separator */}
      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-hidden="true"
      >
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="flex flex-col items-center text-center gap-4 sm:items-start sm:text-left">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: 'rgba(201,168,76,0.08)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.15)' }}
              >
                {pillar.icon}
              </div>
              <div>
                <h3
                  className="mb-1.5 text-base font-semibold text-white"
                  style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                >
                  {pillar.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom separator */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-hidden="true">
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
      </div>
    </section>
  )
}
