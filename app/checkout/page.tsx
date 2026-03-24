'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import OrderSummary from '@/components/checkout/OrderSummary'
import PaymentSimulator from '@/components/checkout/PaymentSimulator'
import type { CheckoutFormData } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, isEmpty, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData | null>(null)

  // Redirect to home if cart is empty
  useEffect(() => {
    if (isEmpty) {
      router.replace('/')
    }
  }, [isEmpty, router])

  const handleFormSubmit = (data: CheckoutFormData) => {
    setFormData(data)
  }

  const handlePay = async () => {
    setLoading(true)
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    clearCart()
    setLoading(false)
  }

  if (isEmpty) return null

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-primary">Checkout</span>
        </nav>

        <h1 className="mb-8 text-3xl font-bold text-primary">Finalizar compra</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left — Form */}
          <div className="space-y-6">
            <CheckoutForm
              onSubmit={handleFormSubmit}
              loading={loading}
            />
          </div>

          {/* Right — Summary + Payment */}
          <div className="space-y-6">
            <OrderSummary items={items} subtotal={subtotal} />
            <PaymentSimulator
              total={subtotal}
              items={items}
              formData={formData}
              onPay={handlePay}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
