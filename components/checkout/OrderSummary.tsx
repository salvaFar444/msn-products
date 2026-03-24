'use client'

import Image from 'next/image'
import { formatCOP } from '@/lib/formatCurrency'
import type { CartItem } from '@/types'

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
}

export default function OrderSummary({ items, subtotal }: OrderSummaryProps) {
  return (
    <div className="card p-6">
      <h2 className="mb-5 text-lg font-semibold text-primary">Resumen del pedido</h2>

      {/* Items */}
      <ul className="space-y-4 mb-6">
        {items.map((item) => (
          <li key={item.product.id} className="flex items-center gap-3">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface-raised">
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                sizes="56px"
                className="object-contain p-1"
              />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised border border-border text-[10px] font-bold text-primary">
                {item.quantity}
              </span>
            </div>
            <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
              <p className="text-sm font-medium text-primary leading-snug line-clamp-2">
                {item.product.name}
              </p>
              <p className="flex-shrink-0 text-sm font-semibold text-primary">
                {formatCOP(item.product.price * item.quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Totals */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="text-primary">{formatCOP(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Envío</span>
          <span className="text-success font-medium">GRATIS</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold">
          <span className="text-primary">Total</span>
          <span className="text-primary text-xl">{formatCOP(subtotal)}</span>
        </div>
      </div>
    </div>
  )
}
