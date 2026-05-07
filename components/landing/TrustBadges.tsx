import { Truck, Lock, ShieldCheck } from 'lucide-react'

const TRUST = [
  { icon: Truck, label: 'Envío gratis' },
  { icon: Lock, label: 'Pago seguro' },
  { icon: ShieldCheck, label: 'Garantía 3 meses' },
] as const

/**
 * Línea horizontal de badges de confianza. Se muestra debajo de los CTAs.
 */
export default function TrustBadges() {
  return (
    <ul
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl border border-border bg-surface px-4 py-3 sm:justify-around"
      aria-label="Garantías de la tienda"
    >
      {TRUST.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex items-center gap-2 text-xs font-semibold text-ink-strong sm:text-sm"
        >
          <Icon className="h-4 w-4 text-ink-strong" strokeWidth={2.2} aria-hidden="true" />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  )
}
