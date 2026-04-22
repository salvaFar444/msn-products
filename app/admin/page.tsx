import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Package,
  AlertTriangle,
  XCircle,
  Plus,
  Edit3,
  Store,
  ArrowUpRight,
  CheckCircle2,
  Boxes,
} from 'lucide-react'
import { getAllProducts } from '@/lib/products'

export const metadata: Metadata = { title: 'Dashboard — Admin' }
export const dynamic = 'force-dynamic'

// --------------------------------------------------------------------------
// Admin dashboard — focused on product CRUD (orders are taken via WhatsApp,
// so there are no sales metrics to show here).
// --------------------------------------------------------------------------
export default async function AdminDashboardPage() {
  const products = await getAllProducts()

  const total = products.length
  const outOfStock = products.filter((p) => p.stock === 0).length
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 3).length
  const healthy = total - outOfStock - lowStock

  const alerts = products
    .filter((p) => p.stock <= 3)
    .sort((a, b) => a.stock - b.stock)

  return (
    <div className="p-6 lg:p-10">
      {/* ------------------------------------------------------------------
          Header
      ------------------------------------------------------------------ */}
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            MSN Products
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Panel de gestión
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Administra el catálogo de productos de tu tienda
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 28px rgba(255,255,255,0.12)',
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />
          Agregar producto
        </Link>
      </header>

      {/* ------------------------------------------------------------------
          Inventory stats — four consistent cards
      ------------------------------------------------------------------ */}
      <section aria-label="Inventario" className="mb-10">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total productos"
            value={total}
            icon={<Boxes className="h-5 w-5" strokeWidth={2} />}
            accent="#FFFFFF"
          />
          <StatCard
            label="En stock saludable"
            value={healthy}
            icon={<CheckCircle2 className="h-5 w-5" strokeWidth={2} />}
            accent="#22C55E"
          />
          <StatCard
            label="Stock bajo"
            value={lowStock}
            icon={<AlertTriangle className="h-5 w-5" strokeWidth={2} />}
            accent="#F59E0B"
          />
          <StatCard
            label="Agotados"
            value={outOfStock}
            icon={<XCircle className="h-5 w-5" strokeWidth={2} />}
            accent="#DC2626"
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------
          Quick actions — three big CTAs for product CRUD
      ------------------------------------------------------------------ */}
      <section aria-label="Acciones rápidas" className="mb-10">
        <h2
          className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Gestión de catálogo
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ActionCard
            href="/admin/products/new"
            title="Agregar producto"
            description="Crea una nueva entrada con imágenes, precio y stock."
            icon={<Plus className="h-5 w-5" strokeWidth={2.5} />}
            highlight
          />
          <ActionCard
            href="/admin/products"
            title="Ver todos los productos"
            description="Editar, actualizar precios o stock, y eliminar productos."
            icon={<Package className="h-5 w-5" strokeWidth={2} />}
          />
          <ActionCard
            href="/"
            external
            title="Ver la tienda"
            description="Abre la vista pública para ver cómo luce tu catálogo."
            icon={<Store className="h-5 w-5" strokeWidth={2} />}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------
          Inventory alerts
      ------------------------------------------------------------------ */}
      <section aria-label="Alertas de inventario">
        <h2
          className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Atención necesaria
        </h2>

        {alerts.length > 0 ? (
          <div
            className="rounded-2xl border p-5"
            style={{
              backgroundColor: '#141414',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <ul className="space-y-2">
              {alerts.map((p) => {
                const agotado = p.stock === 0
                const bg = agotado
                  ? 'rgba(220,38,38,0.08)'
                  : 'rgba(245,158,11,0.06)'
                const border = agotado
                  ? 'rgba(220,38,38,0.22)'
                  : 'rgba(245,158,11,0.22)'
                const color = agotado ? '#FCA5A5' : '#FCD34D'
                return (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
                    style={{
                      backgroundColor: bg,
                      border: `1px solid ${border}`,
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {agotado ? (
                        <XCircle
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color }}
                          aria-hidden="true"
                        />
                      ) : (
                        <AlertTriangle
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate text-sm font-medium text-white">
                        {p.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-semibold"
                        style={{ color }}
                      >
                        {agotado ? 'Agotado' : `${p.stock} unidad${p.stock === 1 ? '' : 'es'}`}
                      </span>
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/90"
                        style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
                      >
                        <Edit3 className="h-3 w-3" aria-hidden="true" strokeWidth={2.5} />
                        Actualizar
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 rounded-2xl border px-5 py-6"
            style={{
              backgroundColor: '#141414',
              borderColor: 'rgba(34,197,94,0.18)',
            }}
          >
            <CheckCircle2
              className="h-5 w-5 flex-shrink-0"
              style={{ color: '#22C55E' }}
              aria-hidden="true"
            />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Todos los productos tienen stock saludable. No hay alertas pendientes.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

// --------------------------------------------------------------------------
// StatCard
// --------------------------------------------------------------------------
function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: '#141414',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          {label}
        </p>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `${accent}1F`,
            color: accent,
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

// --------------------------------------------------------------------------
// ActionCard
// --------------------------------------------------------------------------
function ActionCard({
  href,
  title,
  description,
  icon,
  highlight = false,
  external = false,
}: {
  href: string
  title: string
  description: string
  icon: React.ReactNode
  highlight?: boolean
  external?: boolean
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group relative block rounded-2xl border p-5 transition-colors"
      style={{
        backgroundColor: highlight ? 'rgba(255,255,255,0.06)' : '#141414',
        borderColor: highlight
          ? 'rgba(255,255,255,0.3)'
          : 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-start justify-between">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            backgroundColor: highlight
              ? 'rgba(255,255,255,0.18)'
              : 'rgba(255,255,255,0.06)',
            color: '#FFFFFF',
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <ArrowUpRight
          className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          style={{ color: highlight ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
          aria-hidden="true"
        />
      </div>

      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p
        className="mt-1.5 text-xs leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.55)' }}
      >
        {description}
      </p>
    </Link>
  )
}
