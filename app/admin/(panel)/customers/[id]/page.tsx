import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, User, ShoppingBag, BookUser, History } from 'lucide-react'
import { getCustomerDetail, type CustomerAddress } from '@/lib/admin/data'
import { EmailLink, PhoneLink } from '@/components/admin/ContactLinks'
import CustomerIdentityForm from './CustomerIdentityForm'

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
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badge[value] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {value}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** A postal address block, with the recipient and phone when they differ. */
function AddressBlock({ address }: { address: CustomerAddress }) {
  const recipient = [address.first_name, address.last_name].filter(Boolean).join(' ').trim()
  const cityLine = [address.city, address.state].filter(Boolean).join(', ')
  return (
    <div className="text-sm leading-6">
      {recipient && <div className="font-medium">{recipient}</div>}
      {address.address1 && <div className="text-text-muted">{address.address1}</div>}
      {address.address2 && <div className="text-text-muted">{address.address2}</div>}
      {(cityLine || address.zip) && (
        <div className="text-text-muted">{[cityLine, address.zip].filter(Boolean).join(' ')}</div>
      )}
      {address.country && <div className="text-text-muted">{address.country}</div>}
      {address.phone && (
        <div className="mt-1">
          <PhoneLink phone={address.phone} />
        </div>
      )}
    </div>
  )
}

function SectionCard({
  title,
  icon,
  children,
  action,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2 font-semibold">
          {icon}
          {title}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomerDetail(params.id)
  if (!customer) notFound()

  return (
    <div>
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark text-lg font-bold text-white uppercase">
            {(customer.name && customer.name !== '—' ? customer.name : customer.email).slice(0, 2)}
          </div>
          <CustomerIdentityForm
            id={customer.id}
            name={customer.name}
            firstName={customer.firstName}
            lastName={customer.lastName}
            phoneOnRecord={customer.phoneOnRecord}
            email={customer.email}
            since={formatDate(customer.createdAt)}
          />
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            customer.hasAccount ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {customer.hasAccount ? 'Registered account' : 'Guest checkout'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-2xl font-bold">{customer.stats.orders}</div>
          <div className="text-xs text-text-muted">Orders</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl font-bold">${customer.stats.totalSpent.toFixed(2)}</div>
          <div className="text-xs text-text-muted">Total spent (paid)</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl font-bold">
            {customer.stats.lastOrderAt ? formatDate(customer.stats.lastOrderAt) : '—'}
          </div>
          <div className="text-xs text-text-muted">Last order</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — contact & addresses */}
        <div className="space-y-6">
          <SectionCard title="Contact" icon={<User className="h-4 w-4 text-accent" />}>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-text-muted mb-1">Email</dt>
                <dd>
                  <EmailLink email={customer.email} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-text-muted mb-1">Phone</dt>
                <dd>
                  <PhoneLink phone={customer.phone} />
                </dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Shipping address" icon={<MapPin className="h-4 w-4 text-accent" />}>
            {customer.latestAddress ? (
              <>
                <AddressBlock address={customer.latestAddress} />
                <p className="mt-3 text-xs text-text-muted">From their most recent order.</p>
              </>
            ) : (
              <p className="text-sm text-text-muted">
                No address yet — one is recorded when they place their first order.
              </p>
            )}
          </SectionCard>

          {customer.pastAddresses.length > 0 && (
            <SectionCard
              title={`Previous addresses (${customer.pastAddresses.length})`}
              icon={<History className="h-4 w-4 text-accent" />}
            >
              <div className="space-y-4 divide-y divide-border">
                {customer.pastAddresses.map((a, i) => (
                  <div key={i} className={i > 0 ? 'pt-4' : ''}>
                    <AddressBlock address={a} />
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {customer.savedAddresses.length > 0 && (
            <SectionCard
              title={`Saved address book (${customer.savedAddresses.length})`}
              icon={<BookUser className="h-4 w-4 text-accent" />}
            >
              <div className="space-y-4 divide-y divide-border">
                {customer.savedAddresses.map((a, i) => (
                  <div key={a.id} className={i > 0 ? 'pt-4' : ''}>
                    {a.isDefault && (
                      <span className="mb-1 inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        Default
                      </span>
                    )}
                    <AddressBlock address={a} />
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right column — order history */}
        <div className="lg:col-span-2">
          <SectionCard
            title={`Orders (${customer.orders.length})`}
            icon={<ShoppingBag className="h-4 w-4 text-accent" />}
          >
            {customer.orders.length === 0 ? (
              <p className="text-sm text-text-muted">No orders yet.</p>
            ) : (
              <div className="-m-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-left text-text-muted">
                    <tr>
                      <th className="px-5 py-3 font-medium">Order</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Payment</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customer.orders.map((o) => (
                      <tr key={o.id} className="hover:bg-surface/50">
                        <td className="px-5 py-3">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="font-medium hover:text-accent hover:underline underline-offset-2"
                          >
                            {o.order_number}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-text-muted whitespace-nowrap">
                          {formatDate(o.created_at)}
                        </td>
                        <td className="px-5 py-3">
                          <Badge value={o.payment_status} />
                        </td>
                        <td className="px-5 py-3">
                          <Badge value={o.status} />
                        </td>
                        <td className="px-5 py-3 text-right font-medium">${o.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
