import { getAdminProfile } from '@/lib/admin/data'
import AdminSettingsForm from './AdminSettingsForm'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const profile = await getAdminProfile()
  if (!profile) return null
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-text-muted text-sm">Manage your admin profile and password</p>
      </div>
      <AdminSettingsForm profile={profile} />
    </div>
  )
}
