'use server'

import { revalidatePath } from 'next/cache'
import {
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
} from '@/lib/discounts'
import { parseDiscountCodeForm } from '@/lib/validation/discountSchema'

function formToInput(fd: FormData) {
  const raw = {
    code: String(fd.get('code') ?? ''),
    description: String(fd.get('description') ?? ''),
    discountType: String(fd.get('discountType') ?? ''),
    discountValue: fd.get('discountValue'),
    minOrderAmount: fd.get('minOrderAmount') ?? 0,
    maxUses: fd.get('maxUses') || null,
    isActive: fd.get('isActive') ?? '',
    startsAt: fd.get('startsAt') || null,
    expiresAt: fd.get('expiresAt') || null,
  }
  return raw
}

export async function createDiscountAction(fd: FormData) {
  const parsed = parseDiscountCodeForm(formToInput(fd))
  if (!parsed.ok) return { ok: false as const, error: parsed.error }

  const d = parsed.data
  const result = await createDiscountCode({
    code: d.code,
    description: d.description || null,
    discountType: d.discountType,
    discountValue: d.discountValue,
    minOrderAmount: d.minOrderAmount,
    maxUses: (d.maxUses as number | null) ?? null,
    isActive: d.isActive,
    startsAt: (d.startsAt as string | null) || null,
    expiresAt: (d.expiresAt as string | null) || null,
  })

  if (!result.ok) return { ok: false as const, error: result.error }
  revalidatePath('/admin/discount-codes')
  return { ok: true as const, id: result.discount.id }
}

export async function updateDiscountAction(id: string, fd: FormData) {
  const parsed = parseDiscountCodeForm(formToInput(fd))
  if (!parsed.ok) return { ok: false as const, error: parsed.error }

  const d = parsed.data
  const result = await updateDiscountCode(id, {
    code: d.code,
    description: d.description || null,
    discountType: d.discountType,
    discountValue: d.discountValue,
    minOrderAmount: d.minOrderAmount,
    maxUses: (d.maxUses as number | null) ?? null,
    isActive: d.isActive,
    startsAt: (d.startsAt as string | null) || null,
    expiresAt: (d.expiresAt as string | null) || null,
  })

  if (!result.ok) return { ok: false as const, error: result.error }
  revalidatePath('/admin/discount-codes')
  revalidatePath(`/admin/discount-codes/${id}/edit`)
  return { ok: true as const, id: result.discount.id }
}

export async function deleteDiscountAction(id: string) {
  const ok = await deleteDiscountCode(id)
  if (ok) revalidatePath('/admin/discount-codes')
  return ok ? { ok: true as const } : { ok: false as const, error: 'No se pudo eliminar.' }
}
