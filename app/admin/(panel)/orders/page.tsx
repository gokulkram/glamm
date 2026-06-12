import { getOrders } from '@/lib/admin/data'
import OrdersTable from './OrdersTable'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const orders = await getOrders()
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-text-muted text-sm">{orders.length} order{orders.length === 1 ? '' : 's'} total</p>
      </div>
      <OrdersTable orders={orders} />
    </div>
  )
}
