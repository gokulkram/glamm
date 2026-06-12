'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, Eye } from 'lucide-react'
import type { AdminOrder } from '@/lib/admin/data'
import Pagination from '@/components/admin/Pagination'

const PAGE_SIZE = 10

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

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
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false
      if (!q) return true
      const name = `${o.first_name ?? ''} ${o.last_name ?? ''}`.toLowerCase()
      return o.order_number.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || name.includes(q)
    })
  }, [orders, search, status])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const resetAnd = (fn: () => void) => { fn(); setPage(1) }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => resetAnd(() => setSearch(e.target.value))}
            placeholder="Search by order #, email, name…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <select
          value={status}
          onChange={(e) => resetAnd(() => setStatus(e.target.value))}
          className="px-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent sm:w-48 capitalize"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-text-muted">
                  <ShoppingBag className="mx-auto h-10 w-10 opacity-30 mb-3" />
                  {orders.length === 0 ? 'No orders yet.' : 'No orders match your filters.'}
                </td>
              </tr>
            )}
            {pageItems.map((o) => (
              <tr key={o.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-medium">{o.order_number}</td>
                <td className="px-4 py-3">
                  <div>{`${o.first_name ?? ''} ${o.last_name ?? ''}`.trim() || '—'}</div>
                  <div className="text-xs text-text-muted">{o.email}</div>
                </td>
                <td className="px-4 py-3 text-text-muted">{o.item_count}</td>
                <td className="px-4 py-3 font-medium">${o.total.toFixed(2)}</td>
                <td className="px-4 py-3"><StatusBadge value={o.payment_status} /></td>
                <td className="px-4 py-3"><StatusBadge value={o.status} /></td>
                <td className="px-4 py-3 text-text-muted whitespace-nowrap">{formatDate(o.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-surface"
                  >
                    <Eye className="h-4 w-4" /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  )
}
