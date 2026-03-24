'use client'

import { useState, useEffect, useRef } from 'react'
import { formatCOP } from '@/lib/formatCurrency'
import type { CartItem, CheckoutFormData } from '@/types'

interface NequiPaymentInputProps {
  total: number
  items: CartItem[]
  formData: CheckoutFormData | null
  onSuccess: () => Promise<void>
}

type NequiState = 'idle' | 'sending' | 'waiting' | 'success' | 'error'

const TIMEOUT_SECONDS = 60
const POLL_INTERVAL_MS = 3000

export default function NequiPaymentInput({
  total,
  items,
  formData,
  onSuccess,
}: NequiPaymentInputProps) {
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [state, setState] = useState<NequiState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null }
  }

  useEffect(() => () => stopPolling(), [])

  const validatePhone = (v: string) => /^3\d{9}$/.test(v.replace(/\s/g, ''))

  const startPolling = (txId: string) => {
    let remaining = TIMEOUT_SECONDS
    setTimeLeft(remaining)

    countdownRef.current = setInterval(() => {
      remaining -= 1
      setTimeLeft(remaining)
      if (remaining <= 0) {
        stopPolling()
        setState('error')
        setErrorMsg('Tiempo de espera agotado. Intenta de nuevo.')
      }
    }, 1000)

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/nequi/status?id=${encodeURIComponent(txId)}`)
        const data = await res.json()
        if (data.status === 'approved') {
          stopPolling()
          setState('success')
          await onSuccess()
        } else if (data.status === 'failed') {
          stopPolling()
          setState('error')
          setErrorMsg('Pago rechazado. Verifica tu app Nequi e intenta de nuevo.')
        }
        // 'pending' → keep polling
      } catch {
        // Network glitch — keep polling until timeout
      }
    }, POLL_INTERVAL_MS)
  }

  const handleSend = async () => {
    const cleaned = phone.replace(/\s/g, '')
    if (!validatePhone(cleaned)) {
      setPhoneError('Ingresa un número Nequi válido (10 dígitos, empieza por 3)')
      return
    }
    setPhoneError('')
    setState('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/nequi/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleaned,
          amount: total,
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
          })),
          customer: formData,
        }),
      })
      const data = await res.json()

      if (data.mode === 'mercadopago_fallback') {
        // No Nequi credentials — create MP preference with Nequi highlighted
        const mpRes = await fetch('/api/mercadopago/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({
              productId: i.product.id,
              name: i.product.name,
              price: i.product.price,
              quantity: i.quantity,
            })),
            customer: formData,
            total,
            nequiDefault: true,
          }),
        })
        const mpData = await mpRes.json()
        if (mpData.mode === 'live' && mpData.init_point) {
          window.location.href = mpData.init_point
          return
        }
        // Full fallback to simulation
        setState('success')
        await onSuccess()
        return
      }

      setTransactionId(data.transactionId)
      setState('waiting')
      startPolling(data.transactionId)
    } catch {
      setState('error')
      setErrorMsg('No se pudo conectar con Nequi. Intenta de nuevo.')
    }
  }

  const handleRetry = () => {
    stopPolling()
    setState('idle')
    setErrorMsg('')
    setTimeLeft(TIMEOUT_SECONDS)
    setTransactionId(null)
  }

  if (state === 'waiting') {
    const progress = ((TIMEOUT_SECONDS - timeLeft) / TIMEOUT_SECONDS) * 100
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="rounded-2xl border border-border bg-surface-raised p-5 text-center space-y-3">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white text-lg font-black"
            style={{ background: '#8347AD' }}
          >
            N
          </div>
          <p className="text-sm font-semibold text-primary">Esperando autorización en tu app Nequi</p>
          <p className="text-xs text-muted">
            Abre la app Nequi y acepta la notificación de pago de{' '}
            <span className="font-semibold text-primary">{formatCOP(total)}</span>
          </p>
          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, background: '#8347AD' }}
            />
          </div>
          <p className="text-xs text-muted">{timeLeft}s restantes</p>
        </div>
        <button
          onClick={handleRetry}
          className="w-full text-xs text-muted hover:text-danger transition-colors"
        >
          Cancelar
        </button>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-center space-y-2">
          <p className="text-sm font-medium text-danger">Pago no completado</p>
          <p className="text-xs text-muted">{errorMsg}</p>
        </div>
        <button
          onClick={handleRetry}
          className="flex h-10 w-full items-center justify-center rounded-2xl border border-border text-sm font-medium text-primary hover:bg-surface transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        Nequi — Pago a celular
      </p>
      <div>
        <label htmlFor="nequi-phone" className="mb-1.5 block text-sm font-medium text-primary">
          Número celular Nequi
        </label>
        <input
          id="nequi-phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            if (phoneError) setPhoneError('')
          }}
          placeholder="3001234567"
          maxLength={10}
          disabled={state === 'sending'}
          className={`w-full rounded-xl border bg-surface-raised px-4 py-3 text-sm text-primary placeholder:text-muted-low outline-none transition-colors ${
            phoneError ? 'border-danger/50 focus:border-danger' : 'border-border focus:border-accent'
          }`}
        />
        {phoneError && <p className="mt-1 text-xs text-danger">{phoneError}</p>}
        <p className="mt-1 text-[11px] text-muted">
          Recibirás una notificación de pago de {formatCOP(total)} en la app Nequi.
        </p>
      </div>

      <button
        onClick={handleSend}
        disabled={state === 'sending' || !phone.trim()}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: '#8347AD', boxShadow: '0 4px 16px rgba(131,71,173,0.3)' }}
      >
        {state === 'sending' ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando notificación...
          </>
        ) : (
          <>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-black" aria-hidden="true">N</span>
            Pagar {formatCOP(total)} con Nequi
          </>
        )}
      </button>
    </div>
  )
}
