import Link from 'next/link'
import { DollarSign, ShoppingBag, Users, Package, ArrowRight, AlertTriangle } from 'lucide-react'
import { getOrders, getCustomers } from '@/lib/admin/data'
import { getAllProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-600',
    refunded: 'bg-red-100 text-red-700',
    failed: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[value] ?? 'bg-gray-100 text-gray-600'}`}>
      {value}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount)
}

export default async function AdminDashboard() {
  const [orders, customers, products] = await Promise.all([getOrders(), getCustomers(), getAllProducts()])

  const revenue = orders.filter((o) => o.payment_status === 'paid').reduce((sum, o) => sum + o.total, 0)
  const currency = orders[0]?.currency || 'USD'
  const recentOrders = orders.slice(0, 6)
  const needsAttention = orders
    .filter((o) => o.status === 'pending' || o.payment_status === 'pending' || o.payment_status === 'failed')
    .slice(0, 6)
  const outOfStock = products.filter((p) => !p.inStock).slice(0, 6)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-text-muted text-sm">Overview of your store</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{formatMoney(revenue, currency)}</div>
            <div className="text-xs text-text-muted">Revenue</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold">{orders.length}</div>
            <div className="text-xs text-text-muted">Orders</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold">{customers.length}</div>
            <div className="text-xs text-text-muted">Customers</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold">{products.length}</div>
            <div className="text-xs text-text-muted">
              {products.filter((p) => p.published).length} published
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-accent inline-flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-text-muted">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between gap-3 -mx-2 px-2 py-1.5 rounded-lg hover:bg-black/[0.03]"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">#{o.order_number}</div>
                    <div className="text-xs text-text-muted truncate">
                      {[o.first_name, o.last_name].filter(Boolean).join(' ') || o.email} · {formatDate(o.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium">{formatMoney(o.total, o.currency)}</span>
                    <StatusBadge value={o.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Needs attention */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <h2 className="font-semibold">Needs attention</h2>
          </div>

          {needsAttention.length === 0 && outOfStock.length === 0 ? (
            <p className="text-sm text-text-muted">Nothing needs attention right now.</p>
          ) : (
            <div className="space-y-4">
              {needsAttention.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-text-muted mb-2">Orders</div>
                  <div className="space-y-2">
                    {needsAttention.map((o) => (
                      <Link
                        key={o.id}
                        href={`/admin/orders/${o.id}`}
                        className="flex items-center justify-between gap-3 -mx-2 px-2 py-1.5 rounded-lg hover:bg-black/[0.03]"
                      >
                        <span className="text-sm truncate">#{o.order_number}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <StatusBadge value={o.payment_status} />
                          <StatusBadge value={o.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {outOfStock.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-text-muted mb-2">Out of stock</div>
                  <div className="space-y-2">
                    {outOfStock.map((p) => (
                      <Link
                        key={p.id}
                        href={`/admin/products/${p.id}/edit`}
                        className="flex items-center justify-between gap-3 -mx-2 px-2 py-1.5 rounded-lg hover:bg-black/[0.03]"
                      >
                        <span className="text-sm truncate">{p.title}</span>
                        <span className="text-xs text-text-muted shrink-0">{p.category}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
