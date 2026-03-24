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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="text-2xl font-bold">
            <span className="text-gradient-accent">MSN</span>
            <span className="text-white"> Admin</span>
          </p>
          <p className="mt-1 text-sm text-muted">Panel de administración</p>
        </div>

        <div className="card p-6">
          <h1 className="mb-6 text-lg font-semibold text-white">Iniciar sesión</h1>

          {error && (
            <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white">
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
                className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-white placeholder:text-muted-low outline-none transition-colors focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white">
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
                className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-white placeholder:text-muted-low outline-none transition-colors focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Solo acceso autorizado. Todas las acciones son registradas.
        </p>
      </div>
    </div>
  )
}
