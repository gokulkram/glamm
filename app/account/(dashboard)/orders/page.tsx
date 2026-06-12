import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { getMyOrders } from '@/lib/account/data'
import OrderRow from '../OrderRow'

export const dynamic = 'force-dynamic'

export default async function MyOrdersPage() {
  const { orders } = await getMyOrders()

  return (
    <div>
      <h2 className="font-semibold mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <div className="card p-10 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 opacity-30 mb-3" />
          <p className="text-text-muted mb-4">No orders yet.</p>
          <Link href="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  )
}
