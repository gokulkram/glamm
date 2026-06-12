import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check, Package, Truck, Home, Clock } from 'lucide-react'
import { getMyOrderDetail } from '@/lib/account/data'

export const dynamic = 'force-dynamic'

// Order journey steps for the tracking timeline
const STEPS = [
  { key: 'paid', label: 'Confirmed', icon: Check },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
]

function currentStepIndex(status: string) {
  if (status === 'delivered') return 3
  if (status === 'shipped') return 2
  if (status === 'processing') return 1
  if (status === 'paid') return 0
  return -1 // pending / cancelled / refunded
}

export default async function MyOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getMyOrderDetail(params.id)
  if (!order) notFound()

  const date = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const step = currentStepIndex(order.status)
  const cancelled = order.status === 'cancelled' || order.status === 'refunded'

  return (
    <div>
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold">{order.order_number}</h2>
          <p className="text-text-muted text-sm">Placed on {date}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-muted">Total</div>
          <div className="text-xl font-bold">${order.total.toFixed(2)}</div>
        </div>
      </div>

      {/* Tracking */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold mb-5">Order status</h3>
        {cancelled ? (
          <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700 capitalize">
            <Clock className="h-4 w-4" /> {order.status}
          </div>
        ) : (
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const done = i <= step
              const Icon = s.icon
              return (
                <div key={s.key} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && (
                    <div className={`absolute right-1/2 top-5 h-0.5 w-full -z-0 ${i <= step ? 'bg-accent' : 'bg-border'}`} />
                  )}
                  <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${done ? 'bg-accent text-white' : 'bg-surface text-text-muted border border-border'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`mt-2 text-xs text-center ${done ? 'font-medium text-text' : 'text-text-muted'}`}>{s.label}</span>
                </div>
              )
            })}
          </div>
        )}

        {order.status === 'pending' && (
          <p className="mt-5 text-sm text-text-muted">
            We&apos;ve received your order and will confirm it shortly.
          </p>
        )}
        {order.tracking_number && (
          <div className="mt-5 rounded-lg bg-surface p-4 text-sm">
            <span className="text-text-muted">Tracking number: </span>
            <span className="font-medium">{order.tracking_number}</span>
            {order.tracking_carrier && <span className="text-text-muted"> ({order.tracking_carrier})</span>}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 card overflow-hidden">
          <div className="px-5 py-3 border-b border-border font-semibold">Items ({order.items.length})</div>
          <div className="divide-y divide-border">
            {order.items.map((it, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface">
                  {it.image && <Image src={it.image} alt={it.title} fill className="object-cover" unoptimized />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{it.title}</div>
                  <div className="text-xs text-text-muted">
                    {it.size ? `Size ${it.size} · ` : ''}Qty {it.quantity}
                  </div>
                </div>
                <div className="font-semibold whitespace-nowrap">${it.line_total.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-border space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Shipping</span><span>{order.shipping ? `$${order.shipping.toFixed(2)}` : 'Free'}</span></div>
            <div className="flex justify-between text-base font-bold pt-1.5 border-t border-border"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="card p-5">
          <div className="font-semibold mb-3">Shipping to</div>
          <div className="text-sm text-text-muted leading-relaxed">
            <div className="text-text font-medium">{`${order.first_name ?? ''} ${order.last_name ?? ''}`.trim()}</div>
            {order.address1}<br />
            {order.address2 && <>{order.address2}<br /></>}
            {[order.city, order.state, order.zip].filter(Boolean).join(', ')}<br />
            {order.country}
          </div>
        </div>
      </div>
    </div>
  )
}
