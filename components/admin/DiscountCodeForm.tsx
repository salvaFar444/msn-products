'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { DiscountCode } from '@/types'

export interface DiscountFormResult {
  ok: boolean
  error?: string
  id?: string
}

interface Props {
  initial?: DiscountCode
  action: (formData: FormData) => Promise<DiscountFormResult>
  onDelete?: () => Promise<{ ok: boolean; error?: string }>
}

function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ''
  }
}

export default function DiscountCodeForm({ initial, action, onDelete }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    initial?.discountType ?? 'percentage'
  )

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-white focus:ring-2 focus:ring-white/20'
  const labelClass = 'mb-1.5 block text-sm font-medium text-white'

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await action(fd)
      if (result.ok) {
        setSaved(true)
        setTimeout(() => {
          router.push('/admin/discount-codes')
          router.refresh()
        }, 600)
      } else {
        setError(result.error ?? 'Error al guardar.')
      }
    })
  }

  const handleDeleteClick = () => {
    if (!onDelete) return
    if (!confirm('¿Eliminar este cupón?')) return
    startTransition(async () => {
      const r = await onDelete()
      if (r.ok) {
        router.push('/admin/discount-codes')
        router.refresh()
      } else {
        setError(r.error ?? 'Error al eliminar.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saved && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{
            backgroundColor: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.35)',
            color: '#86EFAC',
          }}
        >
          Guardado ✓
        </div>
      )}

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            backgroundColor: 'rgba(220,38,38,0.1)',
            border: '1px solid rgba(220,38,38,0.35)',
            color: '#FCA5A5',
          }}
        >
          {error}
        </div>
      )}

      <div
        className="rounded-2xl p-6"
        style={{
          backgroundColor: '#141414',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="code" className={labelClass}>
              Código
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              defaultValue={initial?.code ?? ''}
              placeholder="VERANO20"
              className={`${inputClass} uppercase tracking-wider`}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Descripción (opcional)
            </label>
            <input
              id="description"
              name="description"
              type="text"
              defaultValue={initial?.description ?? ''}
              placeholder="Campaña de verano"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="discountType" className={labelClass}>
              Tipo
            </label>
            <select
              id="discountType"
              name="discountType"
              value={discountType}
              onChange={(e) =>
                setDiscountType(e.target.value as 'percentage' | 'fixed')
              }
              className={inputClass}
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto fijo (COP)</option>
            </select>
          </div>

          <div>
            <label htmlFor="discountValue" className={labelClass}>
              Valor {discountType === 'percentage' ? '(%)' : '(COP)'}
            </label>
            <input
              id="discountValue"
              name="discountValue"
              type="number"
              required
              min="0"
              step={discountType === 'percentage' ? '0.01' : '1'}
              defaultValue={initial?.discountValue ?? ''}
              placeholder={discountType === 'percentage' ? '10' : '5000'}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="minOrderAmount" className={labelClass}>
              Monto mínimo de pedido (COP)
            </label>
            <input
              id="minOrderAmount"
              name="minOrderAmount"
              type="number"
              min="0"
              defaultValue={initial?.minOrderAmount ?? 0}
              placeholder="0"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="maxUses" className={labelClass}>
              Máximo de usos (opcional)
            </label>
            <input
              id="maxUses"
              name="maxUses"
              type="number"
              min="1"
              defaultValue={initial?.maxUses ?? ''}
              placeholder="Ilimitado"
              className={inputClass}
            />
            {initial && (
              <p
                className="mt-1 text-xs"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Usos actuales: {initial.currentUses}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="startsAt" className={labelClass}>
              Inicia (opcional)
            </label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(initial?.startsAt)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="expiresAt" className={labelClass}>
              Expira (opcional)
            </label>
            <input
              id="expiresAt"
              name="expiresAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(initial?.expiresAt)}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={initial ? initial.isActive : true}
                className="h-4 w-4 rounded border-white/20 bg-[#1A1A1A]"
              />
              Activo
            </label>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-3 pt-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          {onDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={isPending}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-40"
            >
              Eliminar
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isPending}
            className="rounded-xl border border-white/10 bg-[#1A1A1A] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || saved}
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-lg transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saved ? 'Guardado ✓' : isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  )
}
