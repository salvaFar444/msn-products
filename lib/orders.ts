/**
 * lib/orders.ts — Stubbed order aggregates.
 *
 * Orders are now handled entirely through WhatsApp (no server-side
 * persistence of orders). These helpers exist solely so the admin
 * dashboard keeps compiling. They return empty datasets — the admin
 * will simply show "no sales yet" metrics, which is accurate for the
 * WhatsApp-based flow.
 *
 * If, in the future, you add an orders table back to Supabase, you can
 * replace the bodies of these functions and the admin dashboard will
 * start showing real data without further edits.
 */

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
}

export interface OrderRow {
  id: string
  created_at: string
  status: OrderStatus
  total: number
  items: OrderItem[]
}

export interface DailySales {
  /** Short label for the x-axis — e.g. "Mar 12". */
  label: string
  /** Total revenue for the day (COP). */
  value: number
}

/** Returns the N most recent orders. Currently a no-op (empty list). */
export async function getRecentOrders(_days = 30): Promise<OrderRow[]> {
  return []
}

/** Returns the best-selling product name across the supplied orders. */
export function getTopProduct(orders: OrderRow[]): string | null {
  if (orders.length === 0) return null
  const counts = new Map<string, number>()
  for (const order of orders) {
    for (const item of order.items) {
      counts.set(
        item.product_name,
        (counts.get(item.product_name) ?? 0) + item.quantity,
      )
    }
  }
  let best: { name: string; qty: number } | null = null
  counts.forEach((qty, name) => {
    if (!best || qty > best.qty) best = { name, qty }
  })
  return best ? (best as { name: string; qty: number }).name : null
}

/**
 * Aggregates the supplied orders into a rolling 14-day sales series so
 * the <SalesChart /> component can render without special-casing empty
 * data.
 */
export function aggregateWeeklySales(orders: OrderRow[]): DailySales[] {
  const days = 14
  const today = new Date()
  const buckets = new Map<string, number>()

  // Seed empty buckets for each of the last N days
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    buckets.set(toKey(d), 0)
  }

  for (const order of orders) {
    const key = toKey(new Date(order.created_at))
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + order.total)
    }
  }

  const formatter = new Intl.DateTimeFormat('es-CO', {
    month: 'short',
    day: 'numeric',
  })

  return Array.from(buckets.entries()).map(([key, value]) => ({
    label: formatter.format(new Date(key)),
    value,
  }))
}

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}
