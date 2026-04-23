import type { Metadata } from 'next'
import AdminSidebar from '@/components/admin/AdminSidebar'
import SessionProvider from '@/components/admin/SessionProvider'
import { auth } from '@/auth'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      {/* .admin-dark resets CSS vars to dark theme for all descendants */}
      <div className="admin-dark bg-[#0A0A0A] min-h-screen text-white">
        {/* Sidebar: fixed left column, z-30 — always above content */}
        <AdminSidebar />

        {/* Content area: offset right by sidebar width (w-64 = 256px) */}
        <div className="ml-64">
          {/* Admin top navbar: fixed, starts after sidebar, z-20 */}
          <header className="fixed top-0 right-0 left-64 z-20 h-16 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl flex items-center justify-between px-6">
            <span className="text-sm font-semibold text-white">Panel de Administración</span>
            {session?.user?.email && (
              <span className="text-xs text-white/50">{session.user.email}</span>
            )}
          </header>

          {/* Page content: pushed below fixed navbar (pt-16) */}
          <main className="pt-16 min-h-screen">{children}</main>
        </div>
      </div>
    </SessionProvider>
  )
}
