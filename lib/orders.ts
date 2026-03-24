import { createServerClient } from './supabase-server'
import type { OrderRow, OrderItem } from '@/types'

// ─── Read ─────────────────────────────────────────────────────────

export async function getRecentOrders(days = 30): Promise<OrderRow[]> {
  const client = createServerClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await client
    .from('orders')
    .select('*')
    .eq('status', 'approved')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[orders] getRecentOrders error:', error)
    return []
  }

  return (data ?? []) as OrderRow[]
}

// ─── Analytics helpers ────────────────────────────────────────────

export interface DailySales {
  date: string    // 'YYYY-MM-DD'
  revenue: number
  count: number
}

export function aggregateWeeklySales(orders: OrderRow[]): DailySales[] {
  const map = new Map<string, DailySales>()

  // Initialise last 7 days with zeros
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    map.set(key, { date: key, revenue: 0, count: 0 })
  }

  for (const order of orders) {
    const key = order.created_at.split('T')[0]
    if (map.has(key)) {
      const entry = map.get(key)!
      entry.revenue += order.total
      entry.count += 1
    }
  }

  return Array.from(map.values())
}

export function getTopProduct(orders: OrderRow[]): string {
  const counts = new Map<string, { name: string; qty: number }>()

  for (const order of orders) {
    const items = order.items as OrderItem[]
    for (const item of items) {
      const existing = counts.get(item.productId)
      if (existing) {
        existing.qty += item.quantity
      } else {
        counts.set(item.productId, { name: item.name, qty: item.quantity })
      }
    }
  }

  if (counts.size === 0) return '—'
  return Array.from(counts.values()).sort((a, b) => b.qty - a.qty)[0].name
}

// ─── Write ────────────────────────────────────────────────────────

export async function createOrder(
  order: Omit<OrderRow, 'id' | 'created_at' | 'updated_at'>
): Promise<OrderRow | null> {
  const client = createServerClient()
  const { data, error } = await client
    .from('orders')
    .insert(order)
    .select()
    .single()

  if (error) {
    console.error('[orders] createOrder error:', error)
    return null
  }

  return data as OrderRow
}

export async function updateOrderStatus(
  id: string,
  status: OrderRow['status'],
  mpPaymentId?: string
): Promise<boolean> {
  const client = createServerClient()
  const { error } = await client
    .from('orders')
    .update({
      status,
      ...(mpPaymentId ? { mp_payment_id: mpPaymentId } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('[orders] updateOrderStatus error:', error)
    return false
  }

  return true
}

export async function getOrderByPreferenceId(
  preferenceId: string
): Promise<OrderRow | null> {
  const client = createServerClient()
  const { data, error } = await client
    .from('orders')
    .select('*')
    .eq('mp_preference_id', preferenceId)
    .single()

  if (error || !data) return null
  return data as OrderRow
}
