interface StockBadgeProps {
  stock: number
  className?: string
}

// Admin palette (consistent with dashboard / form / table):
//   danger  -> #DC2626 / #FCA5A5
//   warning -> #F59E0B / #FCD34D
//   success -> #22C55E / #86EFAC
export default function StockBadge({ stock, className }: StockBadgeProps) {
  const agotado = stock === 0
  const bajo = !agotado && stock <= 3

  const bg = agotado
    ? 'rgba(220,38,38,0.15)'
    : bajo
      ? 'rgba(245,158,11,0.15)'
      : 'rgba(34,197,94,0.15)'

  const border = agotado
    ? 'rgba(220,38,38,0.3)'
    : bajo
      ? 'rgba(245,158,11,0.3)'
      : 'rgba(34,197,94,0.3)'

  const text = agotado ? '#FCA5A5' : bajo ? '#FCD34D' : '#86EFAC'
  const dot = agotado ? '#DC2626' : bajo ? '#F59E0B' : '#22C55E'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className ?? ''}`}
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: text,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: dot }}
        aria-hidden="true"
      />
      {agotado ? 'Agotado' : `${stock} un.`}
    </span>
  )
}
