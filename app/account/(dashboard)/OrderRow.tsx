import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { MyOrderSummary } from '@/lib/account/data'

const badge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
  refunded: 'bg-red-100 text-red-700',
}

export default function OrderRow({ order }: { order: MyOrderSummary }) {
  const date = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="card p-4 flex items-center gap-4 hover:shadow-large transition-shadow"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold">{order.order_number}</span>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${badge[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {order.status}
          </span>
        </div>
        <div className="text-xs text-text-muted mt-0.5">
          {date} · {order.item_count} item{order.item_count === 1 ? '' : 's'}
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold">${order.total.toFixed(2)}</div>
      </div>
      <ChevronRight className="h-5 w-5 text-text-muted shrink-0" />
    </Link>
  )
}
