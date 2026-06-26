'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import type { Coupon } from '@/lib/coupons'

function statusOf(c: Coupon): { label: string; cls: string } {
  const now = Date.now()
  if (!c.active) return { label: 'Inactive', cls: 'bg-gray-100 text-gray-600' }
  if (c.startsAt && now < Date.parse(c.startsAt)) return { label: 'Scheduled', cls: 'bg-blue-100 text-blue-700' }
  if (c.expiresAt && now > Date.parse(c.expiresAt)) return { label: 'Expired', cls: 'bg-gray-100 text-gray-600' }
  if (c.maxRedemptions != null && c.timesRedeemed >= c.maxRedemptions)
    return { label: 'Used up', cls: 'bg-gray-100 text-gray-600' }
  return { label: 'Active', cls: 'bg-green-100 text-green-700' }
}

const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleDateString() : '—')

export default function DiscountTable({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (c: Coupon) => {
    if (!confirm(`Delete code "${c.code}"? This cannot be undone.`)) return
    setError(null)
    setDeletingId(c.id)
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Failed to delete coupon')
      setDeletingId(null)
      return
    }
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="card overflow-hidden">
      {error && <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Min spend</th>
              <th className="px-4 py-3 font-medium">Used</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.map((c) => {
              const st = statusOf(c)
              return (
                <tr key={c.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.type === 'percent' ? `${c.value}% off` : `$${c.value.toFixed(2)} off`}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{c.minSubtotal > 0 ? `$${c.minSubtotal.toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3 text-text-muted tabular-nums">
                    {c.timesRedeemed}
                    {c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ''}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{fmtDate(c.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/discounts/${c.id}/edit`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={deletingId === c.id}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        aria-label="Delete"
                      >
                        {deletingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
