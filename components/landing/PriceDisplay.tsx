import { formatCOP } from '@/lib/formatCurrency'
import type { ShopifyMoney } from '@/lib/shopify'

interface PriceDisplayProps {
  price: ShopifyMoney
  compareAtPrice?: ShopifyMoney | null
  size?: 'md' | 'lg' | 'xl'
}

/**
 * Precio con descuento opcional (precio actual + tachado + % off).
 * Recibe ShopifyMoney en formato { amount: "129900", currencyCode: "COP" }.
 */
export default function PriceDisplay({
  price,
  compareAtPrice,
  size = 'lg',
}: PriceDisplayProps) {
  const current = Number(price.amount)
  const original = compareAtPrice ? Number(compareAtPrice.amount) : null
  const hasDiscount = original !== null && original > current
  const discountPct = hasDiscount
    ? Math.round(((original - current) / original) * 100)
    : 0

  const sizes = {
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  } as const

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span
        className={`font-display font-extrabold leading-none text-ink-strong ${sizes[size]}`}
      >
        {formatCOP(current)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-base font-medium text-ink-muted line-through">
            {formatCOP(original)}
          </span>
          <span className="rounded-md bg-success-soft px-2 py-0.5 text-xs font-bold text-success">
            -{discountPct}%
          </span>
        </>
      )}
    </div>
  )
}
