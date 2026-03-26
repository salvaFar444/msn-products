const reviews = [
  {
    name: 'Camila R.',
    city: 'Bogotá',
    text: 'Mis AirPods llegaron en 2 días y son 100% originales. El envío fue completamente gratis. ¡Volveré a comprar!',
    stars: 5,
  },
  {
    name: 'Andrés M.',
    city: 'Medellín',
    text: 'El cable USB-C Original Apple es de excelente calidad. Me llegó rápido, sin costo de envío. Muy recomendado.',
    stars: 5,
  },
  {
    name: 'Valentina S.',
    city: 'Cali',
    text: 'Pedí el Apple Watch y llegó antes de lo esperado. El servicio por WhatsApp es muy rápido. ¡Envío gratis a toda Colombia!',
    stars: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      {/* Section header */}
      <div className="mb-12 text-center">
        <p
          className="mb-3 text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: '#C9A84C' }}
        >
          Reseñas
        </p>
        <h2
          className="text-3xl font-bold text-white sm:text-4xl"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif', lineHeight: 1.1 }}
        >
          Lo que dicen nuestros clientes
        </h2>
        <p className="mt-3 text-sm" style={{ color: '#888888' }}>
          Más de 500 clientes satisfechos en todo el país
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {reviews.map((review) => (
          <div
            key={review.name}
            className="flex flex-col gap-4 rounded-2xl p-6"
            style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Stars */}
            <div className="flex gap-1" aria-label={`${review.stars} de 5 estrellas`}>
              {Array.from({ length: review.stars }).map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="#C9A84C"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.83-4.401Z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <p className="flex-1 text-sm leading-relaxed" style={{ color: '#888888' }}>
              &ldquo;{review.text}&rdquo;
            </p>

            {/* Author */}
            <div
              className="flex items-center gap-3 pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}
                aria-hidden="true"
              >
                {review.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{review.name}</p>
                <p className="text-xs" style={{ color: '#666666' }}>{review.city}, Colombia</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
