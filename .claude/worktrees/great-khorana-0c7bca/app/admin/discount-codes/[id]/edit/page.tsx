import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import DiscountCodeForm, { type DiscountFormResult } from '@/components/admin/DiscountCodeForm'
import { getDiscountCodeById } from '@/lib/discounts'
import { updateDiscountAction, deleteDiscountAction } from '../../actions'

export const metadata: Metadata = { title: 'Editar cupón — Admin' }
export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export default async function EditDiscountPage({ params }: Props) {
  const discount = await getDiscountCodeById(params.id)
  if (!discount) notFound()

  async function action(fd: FormData): Promise<DiscountFormResult> {
    'use server'
    const r = await updateDiscountAction(params.id, fd)
    return r.ok ? { ok: true, id: r.id } : { ok: false, error: r.error }
  }

  async function del() {
    'use server'
    return await deleteDiscountAction(params.id)
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
      <h1 className="mb-6 text-2xl font-bold text-white">
        Editar cupón: <span className="font-mono">{discount.code}</span>
      </h1>
      <DiscountCodeForm initial={discount} action={action} onDelete={del} />
    </div>
  )
}
