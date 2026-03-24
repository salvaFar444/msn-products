import { cn } from '@/lib/utils'

interface StockBadgeProps {
  stock: number
  className?: string
}

export default function StockBadge({ stock, className }: StockBadgeProps) {
  const { label, styles } =
    stock === 0
      ? { label: 'Agotado', styles: 'bg-danger/15 text-danger border-danger/20' }
      : stock <= 3
      ? { label: `${stock} un.`, styles: 'bg-warning/15 text-warning border-warning/20' }
      : { label: `${stock} un.`, styles: 'bg-success/15 text-success border-success/20' }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        styles,
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          stock === 0
            ? 'bg-danger'
            : stock <= 3
            ? 'bg-warning'
            : 'bg-success'
        )}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
