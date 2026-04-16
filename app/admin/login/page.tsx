'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Credenciales incorrectas. Intenta de nuevo.')
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    // Full-screen overlay — covers sidebar/navbar rendered by /admin/layout.tsx
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="text-2xl font-bold">
            <span style={{ color: '#E87A00' }}>MSN</span>
            <span style={{ color: '#FFFFFF' }}> Admin</span>
          </p>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Panel de administración
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          <h1
            className="mb-6 text-lg font-semibold"
            style={{ color: '#FFFFFF' }}
          >
            Iniciar sesión
          </h1>

          {error && (
            <div
              className="mb-4 rounded-xl px-4 py-3 text-sm"
              style={{
                backgroundColor: 'rgba(220,38,38,0.1)',
                border: '1px solid rgba(220,38,38,0.3)',
                color: '#FCA5A5',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium"
                style={{ color: '#FFFFFF' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@msnproducts.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: '#242424',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                }}
                onFocus={(e) => {
                  ;(e.currentTarget as HTMLInputElement).style.borderColor = '#E87A00'
                }}
                onBlur={(e) => {
                  ;(e.currentTarget as HTMLInputElement).style.borderColor =
                    'rgba(255,255,255,0.1)'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium"
                style={{ color: '#FFFFFF' }}
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: '#242424',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                }}
                onFocus={(e) => {
                  ;(e.currentTarget as HTMLInputElement).style.borderColor = '#E87A00'
                }}
                onBlur={(e) => {
                  ;(e.currentTarget as HTMLInputElement).style.borderColor =
                    'rgba(255,255,255,0.1)'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#E87A00',
                color: '#FFFFFF',
                boxShadow: '0 10px 24px rgba(232,122,0,0.25)',
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#C96700'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#E87A00'
              }}
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Solo acceso autorizado. Todas las acciones son registradas.
        </p>
      </div>
    </div>
  )
}
