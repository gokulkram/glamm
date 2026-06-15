import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, User, CreditCard } from 'lucide-react'
import { getOrderDetail } from '@/lib/admin/data'
import OrderManager from './OrderManager'

export const dynamic = 'force-dynamic'

const badge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
  refunded: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
}

function Badge({ value }: { value: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badge[value] ?? 'bg-gray-100 text-gray-600'}`}>
      {value}
    </span>
  )
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderDetail(params.id)
  if (!order) notFound()

  const customerName = `${order.first_name ?? ''} ${order.last_name ?? ''}`.trim() || '—'
  const date = new Date(order.created_at).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-text-muted text-sm">{date}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge value={order.payment_status} />
          <Badge value={order.status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-3 border-b border-border font-semibold">
            Items ({order.items.length})
          </div>
          <div className="divide-y divide-border">
            {order.items.map((it, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface">
                  {it.image && <Image src={it.image} alt={it.title} fill className="object-cover" unoptimized />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{it.title}</div>
                  <div className="text-xs text-text-muted">
                    {it.size ? `Size ${it.size} · ` : ''}Qty {it.quantity} × ${it.unit_price.toFixed(2)}
                  </div>
                </div>
                <div className="font-semibold whitespace-nowrap">${it.line_total.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-border space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Shipping</span><span>{order.shipping ? `$${order.shipping.toFixed(2)}` : 'Free'}</span></div>
            <div className="flex justify-between text-base font-bold pt-1.5 border-t border-border">
              <span>Total</span><span>${order.total.toFixed(2)} {order.currency}</span>
            </div>
          </div>
        </div>

        {/* Customer / shipping / payment */}
        <div className="space-y-6">
          <OrderManager
            id={order.id}
            status={order.status}
            paymentStatus={order.payment_status}
            trackingNumber={order.tracking_number}
            trackingCarrier={order.tracking_carrier}
          />

          <div className="card p-5">
            <div className="flex items-center gap-2 font-semibold mb-3"><User className="h-4 w-4 text-accent" /> Customer</div>
            <div className="text-sm space-y-1">
              <div className="font-medium">{customerName}</div>
              <div className="text-text-muted">{order.email}</div>
              {order.phone && <div className="text-text-muted">{order.phone}</div>}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 font-semibold mb-3"><MapPin className="h-4 w-4 text-accent" /> Shipping address</div>
            <div className="text-sm text-text-muted leading-relaxed">
              {order.address1 ? (
                <>
                  {order.address1}<br />
                  {order.address2 && <>{order.address2}<br /></>}
                  {[order.city, order.state, order.zip].filter(Boolean).join(', ')}<br />
                  {order.country}
                </>
              ) : (
                '—'
              )}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 font-semibold mb-3"><CreditCard className="h-4 w-4 text-accent" /> Payment</div>
            <div className="text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-text-muted">Method</span><span className="capitalize">{order.payment_method ?? '—'}</span></div>
              <div className="flex justify-between items-center"><span className="text-text-muted">Status</span><Badge value={order.payment_status} /></div>
              {order.transaction_id && (
                <div className="flex justify-between"><span className="text-text-muted">Txn</span><span className="font-mono text-xs">{order.transaction_id}</span></div>
              )}
              {order.tracking_number && (
                <div className="flex justify-between"><span className="text-text-muted">Tracking</span><span>{order.tracking_number}</span></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
