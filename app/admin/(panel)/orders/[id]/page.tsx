import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, User, CreditCard, Truck, ExternalLink, AlertTriangle } from 'lucide-react'
import { getOrderDetail } from '@/lib/admin/data'
import { getClaimForOrder } from '@/lib/claims'
import { EmailLink, PhoneLink, paymentLabel } from '@/components/admin/ContactLinks'
import ClaimStatus from '@/components/ClaimStatus'
import OrderManager from './OrderManager'
import ClaimManager from './ClaimManager'

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

/** One label/value line in the Payment and Fulfilment cards. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-text-muted shrink-0">{label}</dt>
      <dd className="text-right min-w-0">{children}</dd>
    </div>
  )
}

function fullDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderDetail(params.id)
  if (!order) notFound()

  // Photos live in a private bucket; getClaimForOrder signs them for this render.
  const claim = await getClaimForOrder(order.id)

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
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
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
                    {it.slug ? (
                      <Link
                        href={`/products/${it.slug}`}
                        target="_blank"
                        className="font-medium truncate hover:text-accent hover:underline underline-offset-2 block"
                      >
                        {it.title}
                      </Link>
                    ) : (
                      <div className="font-medium truncate">{it.title}</div>
                    )}
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
              {order.discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                  <span>−${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-1.5 border-t border-border">
                <span>Total</span><span>${order.total.toFixed(2)} {order.currency}</span>
              </div>
            </div>
          </div>

          {claim && (
            <div className="card p-5">
              <div className="flex items-center gap-2 font-semibold mb-3">
                <AlertTriangle className="h-4 w-4 text-accent" /> Damage claim
              </div>
              <ClaimStatus claim={claim} />
              <ClaimManager id={claim.id} status={claim.status} adminNote={claim.admin_note} />
            </div>
          )}
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
            <div className="text-sm space-y-1.5">
              {order.customerId ? (
                <Link
                  href={`/admin/customers/${order.customerId}`}
                  className="inline-flex items-center gap-1.5 font-medium hover:text-accent hover:underline underline-offset-2"
                >
                  {customerName}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <div className="font-medium">{customerName}</div>
              )}
              <div><EmailLink email={order.email} /></div>
              {order.phone && <div><PhoneLink phone={order.phone} /></div>}
              {!order.customerId && (
                <p className="text-xs text-text-muted pt-1">
                  No customer record matches this email.
                </p>
              )}
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
            <dl className="text-sm space-y-1.5">
              <Row label="Method">{paymentLabel(order.payment_method)}</Row>
              <Row label="Status"><Badge value={order.payment_status} /></Row>
              <Row label="Amount">
                <span className="font-medium">${order.total.toFixed(2)} {order.currency}</span>
              </Row>
              {order.transaction_id && (
                <Row label="Transaction">
                  <span className="font-mono text-xs break-all">{order.transaction_id}</span>
                </Row>
              )}
              {order.auth_code && (
                <Row label="Auth code">
                  <span className="font-mono text-xs">{order.auth_code}</span>
                </Row>
              )}
              {order.coupon_code && <Row label="Coupon">{order.coupon_code}</Row>}
              <Row label="Placed">
                <span className="text-right">{fullDate(order.created_at)}</span>
              </Row>
              {order.updated_at && order.updated_at !== order.created_at && (
                <Row label="Updated">
                  <span className="text-right">{fullDate(order.updated_at)}</span>
                </Row>
              )}
            </dl>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 font-semibold mb-3"><Truck className="h-4 w-4 text-accent" /> Fulfilment</div>
            <dl className="text-sm space-y-1.5">
              <Row label="Status"><Badge value={order.status} /></Row>
              <Row label="Carrier">{order.tracking_carrier || '—'}</Row>
              <Row label="Tracking">
                {order.tracking_number ? (
                  <span className="font-mono text-xs break-all">{order.tracking_number}</span>
                ) : (
                  <span className="text-text-muted">Not shipped yet</span>
                )}
              </Row>
            </dl>
          </div>

        </div>
      </div>
    </div>
  )
}
