import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { getAdminProfile } from '@/lib/admin/data'
import AdminSidebar from './AdminSidebar'
import AdminMobileNav from './AdminMobileNav'

export const dynamic = 'force-dynamic'

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser()
  if (!user) redirect('/admin/login')
  const profile = await getAdminProfile()

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar email={user.email ?? ''} name={profile?.name} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top nav (sidebar is hidden on small screens) */}
        <AdminMobileNav />

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl w-full">{children}</main>
      </div>
    </div>
  )
}
