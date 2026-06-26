import Link from 'next/link'
import { Plus, Ticket } from 'lucide-react'
import { listCoupons } from '@/lib/coupons'
import DiscountTable from './DiscountTable'

export const dynamic = 'force-dynamic'

export default async function DiscountsPage() {
  const coupons = await listCoupons()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Discounts</h1>
          <p className="text-text-muted text-sm">Create and manage coupon codes</p>
        </div>
        <Link href="/admin/discounts/new" className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Add Discount
        </Link>
      </div>

      {coupons.length === 0 ? (
        <div className="card p-12 text-center text-text-muted">
          <Ticket className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="mb-4">No discount codes yet.</p>
          <Link href="/admin/discounts/new" className="btn btn-primary inline-flex">
            <Plus className="h-4 w-4" /> Create your first code
          </Link>
        </div>
      ) : (
        <DiscountTable coupons={coupons} />
      )}
    </div>
  )
}
