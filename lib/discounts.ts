import { createServerClient } from './supabase-server'
import { supabase } from './supabase'
import {
  rowToDiscountCode,
  type DiscountCode,
  type DiscountCodeRow,
  type AppliedDiscount,
} from '@/types'

export type DiscountValidationResult =
  | { ok: true; discount: AppliedDiscount }
  | { ok: false; error: string; hint?: string }

const TABLE = 'discount_codes'

export async function listDiscountCodes(): Promise<DiscountCode[]> {
  const db = createServerClient()
  const { data, error } = await db
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[listDiscountCodes]', error)
    return []
  }
  return (data as DiscountCodeRow[]).map(rowToDiscountCode)
}

export async function getDiscountCodeById(
  id: string
): Promise<DiscountCode | null> {
  const db = createServerClient()
  const { data, error } = await db.from(TABLE).select('*').eq('id', id).single()
  if (error || !data) return null
  return rowToDiscountCode(data as DiscountCodeRow)
}

export interface DiscountCodeInput {
  code: string
  description?: string | null
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount?: number
  maxUses?: number | null
  isActive?: boolean
  startsAt?: string | null
  expiresAt?: string | null
}

export async function createDiscountCode(
  input: DiscountCodeInput
): Promise<{ ok: true; discount: DiscountCode } | { ok: false; error: string }> {
  const db = createServerClient()
  const { data, error } = await db
    .from(TABLE)
    .insert({
      code: input.code,
      description: input.description ?? null,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      min_order_amount: input.minOrderAmount ?? 0,
      max_uses: input.maxUses ?? null,
      is_active: input.isActive ?? true,
      starts_at: input.startsAt ?? null,
      expires_at: input.expiresAt ?? null,
    })
    .select('*')
    .single()
  if (error || !data) {
    if (error?.code === '23505') {
      return { ok: false, error: 'Ya existe un cupón con ese código.' }
    }
    return { ok: false, error: error?.message ?? 'Error al crear cupón.' }
  }
  return { ok: true, discount: rowToDiscountCode(data as DiscountCodeRow) }
}

export async function updateDiscountCode(
  id: string,
  input: DiscountCodeInput
): Promise<{ ok: true; discount: DiscountCode } | { ok: false; error: string }> {
  const db = createServerClient()
  const { data, error } = await db
    .from(TABLE)
    .update({
      code: input.code,
      description: input.description ?? null,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      min_order_amount: input.minOrderAmount ?? 0,
      max_uses: input.maxUses ?? null,
      is_active: input.isActive ?? true,
      starts_at: input.startsAt ?? null,
      expires_at: input.expiresAt ?? null,
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error || !data) {
    if (error?.code === '23505') {
      return { ok: false, error: 'Ya existe un cupón con ese código.' }
    }
    return { ok: false, error: error?.message ?? 'Error al actualizar cupón.' }
  }
  return { ok: true, discount: rowToDiscountCode(data as DiscountCodeRow) }
}

export async function deleteDiscountCode(id: string): Promise<boolean> {
  const db = createServerClient()
  const { error } = await db.from(TABLE).delete().eq('id', id)
  if (error) {
    console.error('[deleteDiscountCode]', error)
    return false
  }
  return true
}

export function computeDiscountAmount(
  subtotal: number,
  type: 'percentage' | 'fixed',
  value: number
): number {
  if (subtotal <= 0) return 0
  const raw = type === 'percentage' ? (subtotal * value) / 100 : value
  return Math.min(Math.round(raw), subtotal)
}

export async function validateDiscountCode(
  rawCode: string,
  subtotal: number
): Promise<DiscountValidationResult> {
  const code = rawCode.trim().toUpperCase()
  if (!code) return { ok: false, error: 'Ingresa un código.' }

  const db = createServerClient()
  const { data, error } = await db
    .from(TABLE)
    .select('*')
    .eq('code', code)
    .maybeSingle()

  if (error) {
    console.error('[validateDiscountCode]', error)
    return { ok: false, error: 'Error al validar el cupón.' }
  }
  if (!data) {
    return { ok: false, error: 'Código no encontrado.' }
  }

  const d = rowToDiscountCode(data as DiscountCodeRow)
  const now = new Date()

  if (!d.isActive) {
    return { ok: false, error: 'Este cupón está inactivo.' }
  }
  if (d.startsAt && new Date(d.startsAt) > now) {
    return { ok: false, error: 'Este cupón aún no está disponible.' }
  }
  if (d.expiresAt && new Date(d.expiresAt) < now) {
    return { ok: false, error: 'Este cupón ha expirado.' }
  }
  if (d.maxUses !== null && d.currentUses >= d.maxUses) {
    return { ok: false, error: 'Este cupón alcanzó su máximo de usos.' }
  }
  if (subtotal < d.minOrderAmount) {
    return {
      ok: false,
      error: `Monto mínimo de $${d.minOrderAmount.toLocaleString('es-CO')} requerido.`,
      hint: `Agrega $${(d.minOrderAmount - subtotal).toLocaleString('es-CO')} más para aplicar.`,
    }
  }

  const amount = computeDiscountAmount(subtotal, d.discountType, d.discountValue)
  if (amount <= 0) {
    return { ok: false, error: 'El descuento no aplica a este pedido.' }
  }

  return {
    ok: true,
    discount: {
      code: d.code,
      discountType: d.discountType,
      discountValue: d.discountValue,
      amount,
    },
  }
}

// Client helper — calls the API endpoint so the service_role key stays server-only
export async function validateDiscountViaApi(
  code: string,
  subtotal: number
): Promise<DiscountValidationResult> {
  try {
    const res = await fetch('/api/validate-discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    })
    const json = await res.json()
    return json as DiscountValidationResult
  } catch (err) {
    console.error('[validateDiscountViaApi]', err)
    return { ok: false, error: 'Error de red. Intenta de nuevo.' }
  }
}

// Silence unused-import warning for browser supabase when tree-shaken server-side
void supabase
