import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Ticket, Users } from 'lucide-react'
import { getCouponById, listCouponRedemptions } from '@/lib/coupons'

export const dynamic = 'force-dynamic'

function fullDate(iso: string) {
  // Locale pinned so the server and the browser format this identically.
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function CouponUsesPage({ params }: { params: { id: string } }) {
  const [coupon, redemptions] = await Promise.all([
    getCouponById(params.id),
    listCouponRedemptions(params.id),
  ])
  if (!coupon) notFound()

  const discount =
    coupon.type === 'percent' ? `${coupon.value}% off` : `$${coupon.value.toFixed(2)} off`

  // `coupons.times_redeemed` is a counter bumped at checkout; this list is the
  // rows themselves. They should agree — surface it when they don't rather
  // than quietly showing one number in the table and another here.
  const drifted = coupon.timesRedeemed !== redemptions.length

  return (
    <div>
      <Link
        href="/admin/discounts"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to discounts
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Ticket className="h-5 w-5 text-accent" />
            <span className="font-mono">{coupon.code}</span>
          </h1>
          <p className="text-text-muted text-sm">
            {discount}
            {coupon.maxRedemptions != null ? ` · limit ${coupon.maxRedemptions} uses` : ''}
          </p>
        </div>
        <Link href={`/admin/discounts/${coupon.id}/edit`} className="btn btn-secondary">
          Edit code
        </Link>
      </div>

      {drifted && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          The code&apos;s counter says {coupon.timesRedeemed} use
          {coupon.timesRedeemed === 1 ? '' : 's'}, but {redemptions.length} redemption
          {redemptions.length === 1 ? ' is' : 's are'} recorded. The list below is the
          authoritative one.
        </div>
      )}

      {redemptions.length === 0 ? (
        <div className="card p-12 text-center text-text-muted">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>Nobody has used this code yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">
            {redemptions.length} {redemptions.length === 1 ? 'use' : 'uses'}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Used on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {redemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      {r.customerId ? (
                        <Link
                          href={`/admin/customers/${r.customerId}`}
                          className="inline-flex items-center gap-1.5 font-medium hover:text-accent hover:underline underline-offset-2"
                        >
                          {r.customerName || r.email}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <span className="text-text-muted">Guest</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${r.email}`} className="hover:text-accent hover:underline underline-offset-2">
                        {r.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {r.orderId && r.orderNumber ? (
                        <Link
                          href={`/admin/orders/${r.orderId}`}
                          className="font-mono hover:text-accent hover:underline underline-offset-2"
                        >
                          {r.orderNumber}
                        </Link>
                      ) : (
                        // The FK is `on delete set null`, so a deleted order
                        // leaves the redemption behind with nothing to link to.
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{fullDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
