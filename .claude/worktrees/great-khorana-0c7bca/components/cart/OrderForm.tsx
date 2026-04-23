'use client'

import { forwardRef, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  MessageCircle,
  MapPin,
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { buildWhatsAppOrderUrl, isMonteria } from '@/lib/whatsapp'
import { orderFormSchema, type OrderFormValues } from '@/lib/validation/orderSchema'
import { formatCOP } from '@/lib/formatCurrency'
import {
  ORDER_SUBMISSION_MAX,
  ORDER_SUBMISSION_WINDOW_MS,
} from '@/lib/constants'

const RATE_LIMIT_STORAGE_KEY = 'msn-order-submissions'

type Toast =
  | { kind: 'success'; message: string }
  | { kind: 'ask-clear' }
  | null

function checkRateLimit(): { allowed: boolean; retryInSeconds: number } {
  if (typeof window === 'undefined') return { allowed: true, retryInSeconds: 0 }
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY)
    const now = Date.now()
    const timestamps: number[] = raw ? JSON.parse(raw) : []
    const recent = timestamps.filter(
      (t) => now - t < ORDER_SUBMISSION_WINDOW_MS,
    )
    if (recent.length >= ORDER_SUBMISSION_MAX) {
      const oldest = Math.min(...recent)
      const retryMs = ORDER_SUBMISSION_WINDOW_MS - (now - oldest)
      return { allowed: false, retryInSeconds: Math.ceil(retryMs / 1000) }
    }
    return { allowed: true, retryInSeconds: 0 }
  } catch {
    return { allowed: true, retryInSeconds: 0 }
  }
}

function recordSubmission() {
  if (typeof window === 'undefined') return
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY)
    const now = Date.now()
    const timestamps: number[] = raw ? JSON.parse(raw) : []
    const recent = timestamps
      .filter((t) => now - t < ORDER_SUBMISSION_WINDOW_MS)
      .concat(now)
    sessionStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(recent))
  } catch {
    /* ignore */
  }
}

export default function OrderForm() {
  const {
    isOrderFormOpen,
    closeOrderForm,
    items,
    subtotal,
    discount,
    discountAmount,
    total,
    clearCart,
  } = useCart()

  const [toast, setToast] = useState<Toast>(null)
  const [rateLimited, setRateLimited] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      city: 'Montería',
      neighborhood: '',
      address: '',
      phone: '',
    },
  })

  const watchedCity = watch('city')
  const inMonteria = useMemo(() => isMonteria(watchedCity || ''), [watchedCity])

  // Body scroll lock while open
  useEffect(() => {
    if (isOrderFormOpen) {
      document.body.classList.add('order-form-open')
    } else {
      document.body.classList.remove('order-form-open')
    }
    return () => document.body.classList.remove('order-form-open')
  }, [isOrderFormOpen])

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOrderFormOpen) {
        closeOrderForm()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOrderFormOpen, closeOrderForm])

  // Reset toast/rate-limit whenever the form closes
  useEffect(() => {
    if (!isOrderFormOpen) {
      setToast(null)
      setRateLimited(null)
    }
  }, [isOrderFormOpen])

  const onSubmit = async (values: OrderFormValues) => {
    setRateLimited(null)

    const rl = checkRateLimit()
    if (!rl.allowed) {
      setRateLimited(
        `Demasiados intentos. Intenta de nuevo en ${Math.max(
          1,
          Math.ceil(rl.retryInSeconds / 60),
        )} min.`,
      )
      return
    }

    if (items.length === 0) return

    const url = buildWhatsAppOrderUrl(
      items.map((i) => ({
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      })),
      values,
      discount,
    )

    recordSubmission()

    // Open WhatsApp
    window.open(url, '_blank', 'noopener,noreferrer')

    // Ask the user whether to clear the cart
    setToast({ kind: 'ask-clear' })
  }

  const handleClearCart = () => {
    clearCart()
    reset()
    setToast({
      kind: 'success',
      message: 'Carrito vacío. ¡Gracias por tu pedido!',
    })
    setTimeout(() => {
      closeOrderForm()
    }, 1400)
  }

  const handleKeepCart = () => {
    setToast({
      kind: 'success',
      message: 'Perfecto, tu carrito se mantiene intacto.',
    })
    setTimeout(() => {
      closeOrderForm()
    }, 1200)
  }

  if (!isOrderFormOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-ink-strong/50 backdrop-blur-sm animate-fade-in"
        onClick={closeOrderForm}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-form-title"
        className="fixed inset-0 z-[61] flex items-start justify-center overflow-y-auto px-4 py-8 sm:items-center"
      >
        <div className="relative w-full max-w-lg rounded-2xl bg-background shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div>
              <h2
                id="order-form-title"
                className="font-serif text-2xl font-bold text-ink-strong"
              >
                Completa tu orden
              </h2>
              <p className="mt-1 text-sm text-ink-light">
                Te enviaremos los detalles por WhatsApp.
              </p>
            </div>
            <button
              onClick={closeOrderForm}
              aria-label="Cerrar formulario"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-ink-light transition-colors hover:bg-surface hover:text-ink-strong"
            >
              <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
            {/* Fields */}
            <div className="grid gap-4">
              <Field
                id="fullName"
                label="Nombre completo"
                placeholder="Ej: Laura Martínez"
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  id="city"
                  label="Ciudad"
                  placeholder="Montería"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <Field
                  id="neighborhood"
                  label="Barrio"
                  placeholder="Ej: El Recreo"
                  error={errors.neighborhood?.message}
                  {...register('neighborhood')}
                />
              </div>

              <Field
                id="address"
                label="Dirección"
                placeholder="Calle 41 # 14-20, Torre 2, Apto 501"
                error={errors.address?.message}
                {...register('address')}
              />

              <Field
                id="phone"
                label="Teléfono"
                type="tel"
                inputMode="numeric"
                placeholder="3001234567"
                error={errors.phone?.message}
                hint="10 dígitos, solo números"
                {...register('phone')}
              />
            </div>

            {/* City-conditional notice */}
            <div className="mt-5">
              {inMonteria ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  <CheckCircle2
                    className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold">
                      Domicilio gratis y pago contra entrega disponible.
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-800">
                      Recibes tu pedido en Montería sin costo de envío.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="chip-glass flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm text-ink-strong">
                  <AlertTriangle
                    className="h-5 w-5 flex-shrink-0 text-ink mt-0.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold">
                      Al estar fuera de Montería, coordinaremos el envío por WhatsApp.
                    </p>
                    <p className="mt-0.5 text-xs text-ink-light">
                      El pago contra entrega solo aplica en Montería.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="mt-5 space-y-1.5 rounded-xl bg-surface px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-light">
                  {items.reduce((t, i) => t + i.quantity, 0)} artículo
                  {items.reduce((t, i) => t + i.quantity, 0) !== 1 ? 's' : ''}
                </span>
                <span className="font-semibold text-ink-strong">{formatCOP(subtotal)}</span>
              </div>
              {discount && discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-light">Cupón {discount.code}</span>
                  <span className="font-semibold text-ink-strong">−{formatCOP(discountAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-1.5">
                <span className="text-sm font-semibold text-ink-strong">Total</span>
                <span className="font-serif text-lg font-bold text-ink-strong">
                  {formatCOP(total)}
                </span>
              </div>
            </div>

            {/* Rate limit message */}
            {rateLimited && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {rateLimited}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-whatsapp text-sm font-semibold text-white shadow-sm transition-all hover:bg-whatsapp-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <>
                  <MessageCircle className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
                  Enviar por WhatsApp
                </>
              )}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-muted">
              <MapPin className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
              Tus datos solo se usan para completar este pedido.
            </p>
          </form>

          {/* Toast overlay */}
          {toast && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/95 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-sm px-6 text-center">
                {toast.kind === 'ask-clear' ? (
                  <>
                    <div className="chip-glass mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                      <MessageCircle
                        className="h-6 w-6 text-ink"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="mt-4 font-serif text-xl font-bold text-ink-strong">
                      ¿Ya enviaste el mensaje?
                    </h3>
                    <p className="mt-1.5 text-sm text-ink-light">
                      Si completaste el pedido por WhatsApp, podemos vaciar tu carrito.
                    </p>
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={handleKeepCart}
                        className="flex-1 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink-strong transition-colors hover:bg-surface"
                      >
                        Mantener
                      </button>
                      <button
                        onClick={handleClearCart}
                        className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        Vaciar carrito
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2
                        className="h-6 w-6 text-emerald-600"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-4 font-serif text-lg font-semibold text-ink-strong">
                      {toast.message}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* -------------------------- Field component -------------------------- */

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  hint?: string
}

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { id, label, error, hint, className, ...rest },
  ref,
) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-light"
      >
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink-strong outline-none transition-colors placeholder:text-ink-muted focus:border-ink-strong ${
          error ? 'border-red-300 focus:border-red-500' : 'border-border'
        } ${className ?? ''}`}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
