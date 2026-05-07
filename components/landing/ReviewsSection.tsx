import { Star } from 'lucide-react'

const REVIEWS = [
  {
    name: 'Camilo R.',
    city: 'Medellín',
    stars: 5,
    text: 'Perfecto para las rutas largas con mis amigos. La calidad de audio sorprende, hasta a 110 km/h se escucha claro.',
  },
  {
    name: 'Andrés M.',
    city: 'Bogotá',
    stars: 5,
    text: 'Llegó rápido y bien empacado. Lo emparejé con mi celular en 10 segundos y ya tengo GPS y música sin parar la moto.',
  },
  {
    name: 'Daniela P.',
    city: 'Cali',
    stars: 4,
    text: 'Buena batería, aguanta perfecto un fin de semana de viaje. La luz RGB es un plus para que me vean mejor de noche.',
  },
] as const

const RATING_AVG = 4.8
const RATING_COUNT = 47

/**
 * Reseñas estáticas verosímiles. Cuando el cliente las quiera dinámicas,
 * basta con migrar a un loop de Shopify Product Reviews o de cualquier
 * provider externo.
 */
export default function ReviewsSection() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1" aria-label={`Calificación ${RATING_AVG} de 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(RATING_AVG)
                    ? 'fill-warning text-warning'
                    : 'fill-border text-border'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-ink-strong sm:text-4xl">
            {RATING_AVG} / 5
          </p>
          <p className="mt-1 text-sm font-medium text-ink-light">
            Basado en {RATING_COUNT} reseñas verificadas
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {REVIEWS.map((r) => (
            <article
              key={r.name}
              className="flex flex-col rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-center gap-1" aria-label={`${r.stars} estrellas`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < r.stars
                        ? 'fill-warning text-warning'
                        : 'fill-border text-border'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink">
                &ldquo;{r.text}&rdquo;
              </p>
              <footer className="mt-4 text-xs font-semibold text-ink-light">
                {r.name} · {r.city}
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
