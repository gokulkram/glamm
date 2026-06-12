import Link from 'next/link'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { getMyOrders } from '@/lib/account/data'
import OrderRow from './OrderRow'

export const dynamic = 'force-dynamic'

export default async function AccountDashboard() {
  const { orders } = await getMyOrders()
  const recent = orders.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Quick stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-2xl font-bold">{orders.length}</div>
          <div className="text-sm text-text-muted">Total orders</div>
        </div>
        <div className="card p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-text-muted">Keep shopping</div>
            <div className="font-semibold">Browse the collection</div>
          </div>
          <Link href="/shop" className="btn btn-primary btn-sm">Shop</Link>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent orders</h2>
          {orders.length > 3 && (
            <Link href="/account/orders" className="text-sm text-accent font-medium inline-flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="card p-10 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 opacity-30 mb-3" />
            <p className="text-text-muted mb-4">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
