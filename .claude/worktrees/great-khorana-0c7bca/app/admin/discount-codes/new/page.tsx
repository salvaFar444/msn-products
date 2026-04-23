import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import DiscountCodeForm, { type DiscountFormResult } from '@/components/admin/DiscountCodeForm'
import { createDiscountAction } from '../actions'

export const metadata: Metadata = { title: 'Nuevo cupón — Admin' }
export const dynamic = 'force-dynamic'

export default function NewDiscountPage() {
  async function action(fd: FormData): Promise<DiscountFormResult> {
    'use server'
    const r = await createDiscountAction(fd)
    return r.ok
      ? { ok: true, id: r.id }
      : { ok: false, error: r.error }
  }

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/admin/discount-codes"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium"
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Volver a cupones
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-white">Nuevo cupón</h1>
      <DiscountCodeForm action={action} />
    </div>
  )
}
