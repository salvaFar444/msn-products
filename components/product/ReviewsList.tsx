import { Star, BadgeCheck } from 'lucide-react'
import type { ProductReview } from '@/types'

interface ReviewsListProps {
  reviews: ProductReview[]
  summary: { average: number; count: number } | null
}

function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const px = size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5'
  return (
    <div className="flex items-center gap-0.5" aria-label={`Calificación: ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(value)
        return (
          <Star
            key={i}
            className={`${px} ${filled ? 'text-accent' : 'text-ink-muted/30'}`}
            fill={filled ? 'currentColor' : 'none'}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function ReviewsList({ reviews, summary }: ReviewsListProps) {
  if (!summary) {
    // No reviews yet — don't add friction, just skip the section on the page.
    return null
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-baseline gap-4">
        <h2 className="text-2xl font-extrabold text-ink-strong">Lo que dicen nuestros clientes</h2>
        <div className="flex items-center gap-2">
          <Stars value={summary.average} size="md" />
          <span className="text-lg font-bold text-ink-strong">{summary.average.toFixed(1)}</span>
          <span className="text-sm text-ink-light">
            ({summary.count} reseña{summary.count === 1 ? '' : 's'})
          </span>
        </div>
      </div>

      <ul className="space-y-4">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl bg-white p-5"
            style={{ border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink-strong">{r.authorName}</span>
              {r.authorCity && (
                <span className="text-xs text-ink-light">· {r.authorCity}</span>
              )}
              {r.isVerified && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success"
                  aria-label="Compra verificada"
                >
                  <BadgeCheck className="h-3 w-3" aria-hidden="true" strokeWidth={2.5} />
                  Verificado
                </span>
              )}
              <span className="ml-auto text-xs text-ink-muted">{formatDate(r.createdAt)}</span>
            </div>
            <Stars value={r.rating} />
            <p className="mt-2 text-sm leading-relaxed text-ink">{r.comment}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
