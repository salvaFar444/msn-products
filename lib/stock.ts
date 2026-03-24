/**
 * Stock management — called after a payment is confirmed as approved.
 *
 * Uses the service-role Supabase client to bypass RLS.
 *
 * Note: Supabase JS v2 doesn't support computed UPDATE expressions (e.g. stock - qty)
 * so we do a read-then-write. For higher-traffic stores, create this SQL function once
 * in the Supabase SQL editor:
 *
 *   CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, qty INTEGER)
 *   RETURNS void LANGUAGE sql AS $$
 *     UPDATE products SET stock = GREATEST(0, stock - qty) WHERE id = product_id;
 *   $$;
 *
 * Then replace the implementation below with:
 *   await client.rpc('decrement_stock', { product_id: item.productId, qty: item.quantity })
 */

import { createServerClient } from './supabase-server'
import type { OrderItem } from '@/types'

export async function reduceStockForItems(items: OrderItem[]): Promise<void> {
  if (!items || items.length === 0) return

  const client = createServerClient()

  await Promise.all(
    items.map(async (item) => {
      // Read current stock
      const { data: row, error: readErr } = await client
        .from('products')
        .select('stock')
        .eq('id', item.productId)
        .single()

      if (readErr || !row) {
        console.error('[stock] read failed for', item.productId, readErr)
        return
      }

      const newStock = Math.max(0, (row.stock as number) - item.quantity)

      const { error: writeErr } = await client
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', item.productId)

      if (writeErr) {
        console.error('[stock] update failed for', item.productId, writeErr)
      }
    })
  )
}
