import type { Metadata } from 'next'
import Link from 'next/link'
import { Ticket } from 'lucide-react'
import { listDiscountCodes } from '@/lib/discounts'

export const metadata: Metadata = { title: 'Cupones — Admin' }
export const dynamic = 'force-dynamic'

function formatCOP(n: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n)
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export default async function AdminDiscountsPage() {
  const discounts = await listDiscountCodes()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cupones de descuento</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {discounts.length} cupón{discounts.length !== 1 ? 'es' : ''} creado
            {discounts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/discount-codes/new"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 28px rgba(255,255,255,0.12)',
          }}
        >
          Nuevo cupón
        </Link>
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{
          backgroundColor: '#141414',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {discounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <Ticket
              className="h-8 w-8"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              aria-hidden="true"
            />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Aún no tienes cupones.{' '}
              <Link
                href="/admin/discount-codes/new"
                className="font-semibold text-white hover:underline"
              >
                Crear el primero
              </Link>
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <tr style={{ color: 'rgba(255,255,255,0.55)' }}>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                  Descuento
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                  Mínimo
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                  Usos
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                  Expira
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr
                  key={d.id}
                  className="transition-colors hover:bg-white/[0.03]"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <td className="px-4 py-4">
                    <p className="font-semibold uppercase tracking-wider text-white">
                      {d.code}
                    </p>
                    {d.description && (
                      <p
                        className="mt-0.5 text-xs"
                        style={{ color: 'rgba(255,255,255,0.5)' }}
                      >
                        {d.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-white">
                    {d.discountType === 'percentage'
                      ? `${d.discountValue}%`
                      : formatCOP(d.discountValue)}
                  </td>
                  <td
                    className="hidden md:table-cell px-4 py-4"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {d.minOrderAmount > 0 ? formatCOP(d.minOrderAmount) : '—'}
                  </td>
                  <td
                    className="hidden md:table-cell px-4 py-4"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {d.currentUses}
                    {d.maxUses !== null ? ` / ${d.maxUses}` : ''}
                  </td>
                  <td
                    className="hidden md:table-cell px-4 py-4"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {formatDate(d.expiresAt)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: d.isActive
                          ? 'rgba(34,197,94,0.15)'
                          : 'rgba(255,255,255,0.08)',
                        color: d.isActive ? '#86EFAC' : 'rgba(255,255,255,0.55)',
                      }}
                    >
                      {d.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/discount-codes/${d.id}/edit`}
                      className="text-sm font-semibold text-white hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
