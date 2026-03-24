import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllProducts } from '@/lib/products'
import { getRecentOrders, aggregateWeeklySales, getTopProduct } from '@/lib/orders'
import SalesChart from '@/components/admin/SalesChart'
import { formatCOP } from '@/lib/formatCurrency'

export const metadata: Metadata = { title: 'Dashboard — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [products, recentOrders] = await Promise.all([
    getAllProducts(),
    getRecentOrders(30),
  ])

  const total = products.length
  const outOfStock = products.filter((p) => p.stock === 0).length
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 3).length

  const approvedOrders = recentOrders.filter((o) => o.status === 'approved')
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + o.total, 0)
  const topProduct = getTopProduct(approvedOrders)
  const weeklySales = aggregateWeeklySales(approvedOrders)

  const inventoryStats = [
    { label: 'Total productos', value: total, icon: '📦', color: 'bg-accent/10 border-accent/20', textColor: 'text-accent' },
    { label: 'Stock bajo', value: lowStock, icon: '⚠️', color: 'bg-warning/10 border-warning/20', textColor: 'text-warning' },
    { label: 'Agotados', value: outOfStock, icon: '🚫', color: 'bg-danger/10 border-danger/20', textColor: 'text-danger' },
  ]

  const salesStats = [
    { label: 'Ingresos (30d)', value: formatCOP(totalRevenue), icon: '💰', color: 'bg-success/10 border-success/20', textColor: 'text-success' },
    { label: 'Órdenes aprobadas', value: approvedOrders.length, icon: '✅', color: 'bg-accent/10 border-accent/20', textColor: 'text-accent' },
    { label: 'Producto top', value: topProduct || '—', icon: '🏆', color: 'bg-warning/10 border-warning/20', textColor: 'text-warning', small: true },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Resumen del inventario y ventas</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar producto
        </Link>
      </div>

      {/* Inventory stats */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Inventario</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        {inventoryStats.map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-6 ${stat.color}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{stat.label}</p>
              <span className="text-2xl" aria-hidden="true">{stat.icon}</span>
            </div>
            <p className={`mt-3 text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Sales stats */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Ventas (últimos 30 días)</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        {salesStats.map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-6 ${stat.color}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{stat.label}</p>
              <span className="text-2xl" aria-hidden="true">{stat.icon}</span>
            </div>
            <p className={`mt-3 font-bold ${stat.textColor} ${stat.small ? 'text-lg leading-snug' : 'text-3xl'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Weekly sales chart */}
      <div className="card p-6 mb-6">
        <h2 className="mb-4 text-sm font-semibold text-white">Ventas diarias (últimas 2 semanas)</h2>
        <SalesChart data={weeklySales} />
      </div>

      {/* Inventory alerts */}
      {(outOfStock > 0 || lowStock > 0) && (
        <div className="card p-5 mb-6">
          <h2 className="mb-4 text-sm font-semibold text-white">Alertas de inventario</h2>
          <div className="space-y-2">
            {products
              .filter((p) => p.stock <= 3)
              .sort((a, b) => a.stock - b.stock)
              .map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-surface-raised px-4 py-3">
                  <span className="text-sm text-white">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${p.stock === 0 ? 'text-danger' : 'text-warning'}`}>
                      {p.stock === 0 ? 'Agotado' : `${p.stock} unidades`}
                    </span>
                    <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-accent hover:underline">
                      Actualizar
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link href="/admin/products" className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors">
          Ver todos los productos
        </Link>
        <Link href="/" target="_blank" className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-white transition-colors">
          Ver tienda →
        </Link>
      </div>
    </div>
  )
}
