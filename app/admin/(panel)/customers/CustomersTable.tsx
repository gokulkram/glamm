'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Users, Eye } from 'lucide-react'
import type { AdminCustomer } from '@/lib/admin/data'
import Pagination from '@/components/admin/Pagination'
import { usePagination } from '@/components/admin/usePagination'
import { EmailLink, PhoneLink } from '@/components/admin/ContactLinks'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function CustomersTable({ customers }: { customers: AdminCustomer[] }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    // Digits-only copy of the query so "555 0134" still matches "(555) 0134".
    const digits = q.replace(/\D/g, '')
    return customers.filter(
      (c) =>
        c.email.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.city ?? '').toLowerCase().includes(q) ||
        (c.state ?? '').toLowerCase().includes(q) ||
        (digits !== '' && (c.phone ?? '').replace(/\D/g, '').includes(digits)),
    )
  }, [customers, search])

  const paging = usePagination(filtered)
  const pageItems = paging.pageItems

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="relative sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              paging.setPage(1)
            }}
            placeholder="Search by name, email, phone or city…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total spent</th>
              <th className="px-4 py-3 font-medium">Last order</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-text-muted">
                  <Users className="mx-auto h-10 w-10 opacity-30 mb-3" />
                  {customers.length === 0
                    ? 'No customers yet — they appear here after their first order.'
                    : 'No customers match your search.'}
                </td>
              </tr>
            )}
            {pageItems.map((c) => {
              const location = [c.city, c.state].filter(Boolean).join(', ')
              return (
                <tr key={c.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="group flex items-center gap-3"
                      title={`View ${c.name}`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark text-xs font-bold text-white uppercase">
                        {(c.name && c.name !== '—' ? c.name : c.email).slice(0, 2)}
                      </div>
                      <span className="font-medium group-hover:text-accent group-hover:underline underline-offset-2">
                        {c.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 max-w-[16rem]">
                    <EmailLink email={c.email} />
                  </td>
                  <td className="px-4 py-3">
                    <PhoneLink phone={c.phone} />
                  </td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                    {location || <span className="text-text-muted/50">—</span>}
                  </td>
                  <td className="px-4 py-3">{c.orders}</td>
                  <td className="px-4 py-3 font-medium">${c.totalSpent.toFixed(2)}</td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap">{formatDate(c.lastOrderAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-surface hover:text-accent"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination {...paging.paginationProps} />
    </div>
  )
}
