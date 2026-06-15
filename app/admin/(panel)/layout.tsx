import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package, Tags, ShoppingBag, Users, Settings } from 'lucide-react'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { getAdminProfile } from '@/lib/admin/data'
import AdminSidebar from './AdminSidebar'

export const dynamic = 'force-dynamic'

const MOBILE_NAV = [
  { href: '/admin', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser()
  if (!user) redirect('/admin/login')
  const profile = await getAdminProfile()

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar email={user.email ?? ''} name={profile?.name} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top nav (sidebar is hidden on small screens) */}
        <div
          className="md:hidden flex items-center gap-1 overflow-x-auto px-3 py-2 text-white"
          style={{ background: 'linear-gradient(135deg, #0a1121, #1a2744)' }}
        >
          {MOBILE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-sm text-white/80 hover:bg-white/10"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl w-full">{children}</main>
      </div>
    </div>
  )
}
