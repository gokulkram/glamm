import { getAdminProfile } from '@/lib/admin/data'
import { getShippingConfig, getProductContent } from '@/lib/settings'
import AdminSettingsForm from './AdminSettingsForm'
import ShippingSettingsForm from './ShippingSettingsForm'
import ProductContentForm from './ProductContentForm'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const [profile, shipping, productContent] = await Promise.all([
    getAdminProfile(),
    getShippingConfig(),
    getProductContent(),
  ])
  if (!profile) return null
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-text-muted text-sm">Manage your admin profile, password, and shipping rates</p>
      </div>

      <AdminSettingsForm profile={profile} />

      <div className="mt-10">
        <h2 className="text-lg font-bold mb-1">Shipping</h2>
        <p className="text-text-muted text-sm mb-4">
          Set your free-shipping threshold and flat rate. These apply across the store immediately.
        </p>
        <ShippingSettingsForm initial={shipping} />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold mb-1">Product Content</h2>
        <p className="text-text-muted text-sm mb-4">
          The Hair Care and Shipping &amp; Returns tabs shown on every product page.
        </p>
        <ProductContentForm initial={productContent} />
      </div>
    </div>
  )
}
