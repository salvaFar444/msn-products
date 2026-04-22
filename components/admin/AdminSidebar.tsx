'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  Ticket,
  ExternalLink,
  LogOut,
} from 'lucide-react'

const NAV = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/admin/products',
    label: 'Productos',
    icon: Package,
    exact: false,
  },
  {
    href: '/admin/discount-codes',
    label: 'Cupones',
    icon: Ticket,
    exact: false,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col px-3 py-6"
      style={{
        backgroundColor: '#0A0A0A',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ------------------------------------------------------------------
          Logo
      ------------------------------------------------------------------ */}
      <div className="mb-8 px-3">
        <p className="text-lg font-bold leading-tight">
          <span style={{ color: '#FFFFFF' }}>MSN</span>
          <span style={{ color: '#FFFFFF' }}> Admin</span>
        </p>
        <p
          className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Panel de gestión
        </p>
      </div>

      {/* ------------------------------------------------------------------
          Navigation
      ------------------------------------------------------------------ */}
      <nav className="flex-1 space-y-1" aria-label="Admin">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
              style={{
                backgroundColor: active
                  ? 'rgba(255,255,255,0.08)'
                  : 'transparent',
                color: active ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
              }}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* ------------------------------------------------------------------
          Footer
      ------------------------------------------------------------------ */}
      <div
        className="space-y-1 pt-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          <ExternalLink className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          Ver tienda
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          <LogOut className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
