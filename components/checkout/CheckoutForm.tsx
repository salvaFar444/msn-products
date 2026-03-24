'use client'

import { useState } from 'react'
import { COLOMBIAN_DEPARTMENTS } from '@/lib/constants'
import type { CheckoutFormData } from '@/types'

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void
  loading: boolean
}

export default function CheckoutForm({ onSubmit, loading }: CheckoutFormProps) {
  const [form, setForm] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    city: '',
    address: '',
    notes: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({})

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!form.firstName.trim()) newErrors.firstName = 'Requerido'
    if (!form.lastName.trim()) newErrors.lastName = 'Requerido'
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = 'Email inválido'
    if (!form.phone.trim() || !/^(\+?57)?3\d{9}$/.test(form.phone.replace(/\s/g, '')))
      newErrors.phone = 'Número colombiano inválido'
    if (!form.department) newErrors.department = 'Requerido'
    if (!form.city.trim()) newErrors.city = 'Requerido'
    if (!form.address.trim()) newErrors.address = 'Requerido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  const field = (
    id: keyof CheckoutFormData,
    label: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-primary">
        {label}
        {id !== 'notes' && <span className="text-danger ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={form[id] ?? ''}
        onChange={(e) => {
          setForm((f) => ({ ...f, [id]: e.target.value }))
          if (errors[id]) setErrors((err) => ({ ...err, [id]: undefined }))
        }}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-surface-raised px-4 py-3 text-sm text-primary placeholder:text-muted-low outline-none transition-colors ${
          errors[id]
            ? 'border-danger/50 focus:border-danger'
            : 'border-border focus:border-accent'
        }`}
      />
      {errors[id] && (
        <p className="mt-1 text-xs text-danger">{errors[id]}</p>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Contact info */}
      <section className="card p-6">
        <h2 className="mb-5 text-lg font-semibold text-primary">Información de contacto</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field('firstName', 'Nombre', 'text', 'Juan')}
          {field('lastName', 'Apellido', 'text', 'García')}
          {field('email', 'Email', 'email', 'juan@email.com')}
          {field('phone', 'Teléfono (WhatsApp)', 'tel', '3001234567')}
        </div>
      </section>

      {/* Shipping address */}
      <section className="card p-6">
        <h2 className="mb-5 text-lg font-semibold text-primary">Dirección de envío</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-primary">
              Departamento<span className="text-danger ml-0.5">*</span>
            </label>
            <select
              id="department"
              value={form.department}
              onChange={(e) => {
                setForm((f) => ({ ...f, department: e.target.value }))
                if (errors.department)
                  setErrors((err) => ({ ...err, department: undefined }))
              }}
              className={`w-full rounded-xl border bg-surface-raised px-4 py-3 text-sm text-primary outline-none transition-colors ${
                errors.department
                  ? 'border-danger/50 focus:border-danger'
                  : 'border-border focus:border-accent'
              }`}
            >
              <option value="" disabled className="text-muted-low">
                Selecciona...
              </option>
              {COLOMBIAN_DEPARTMENTS.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-xs text-danger">{errors.department}</p>
            )}
          </div>
          {field('city', 'Ciudad', 'text', 'Medellín')}
          <div className="sm:col-span-2">
            {field('address', 'Dirección completa', 'text', 'Calle 123 # 45-67, Barrio')}
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="card p-6">
        <h2 className="mb-5 text-lg font-semibold text-primary">Notas adicionales</h2>
        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-primary">
            Instrucciones de entrega (opcional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Ej: Dejar en portería, llamar antes de entregar..."
            className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-primary placeholder:text-muted-low outline-none transition-colors focus:border-accent resize-none"
          />
        </div>
      </section>

      {/* Submit handled by PaymentSimulator — no button here */}
      <input type="submit" className="sr-only" tabIndex={-1} aria-hidden="true" />
    </form>
  )
}
