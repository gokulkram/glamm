'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Check, X, Trash2, Loader2, Eye } from 'lucide-react'
import type { Review } from '@/lib/reviews'

function Stars({ n }: { n: number }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < n ? 'fill-accent text-accent' : 'text-gray-300'}`} />
      ))}
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-gray-100 text-gray-600',
}

export default function ReviewsTable({
  reviews,
  productTitles,
}: {
  reviews: Review[]
  productTitles: Record<number, string>
}) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const act = async (id: number, action: 'approve' | 'reject' | 'delete') => {
    if (action === 'delete' && !confirm('Delete this review permanently?')) return
    setError(null)
    setBusyId(id)
    const res =
      action === 'delete'
        ? await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
        : await fetch(`/api/admin/reviews/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: action === 'approve' ? 'approved' : 'rejected' }),
          })
    setBusyId(null)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error || 'Action failed')
      return
    }
    router.refresh()
  }

  return (
    <div className="card overflow-hidden">
      {error && <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Review</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reviews.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-text-muted">
                  No reviews yet.
                </td>
              </tr>
            )}
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-surface/50 align-top">
                <td className="px-4 py-3 max-w-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Stars n={r.rating} />
                    <span className="font-medium">{r.author_name}</span>
                  </div>
                  {r.title && <div className="font-medium">{r.title}</div>}
                  {r.body && <div className="text-text-muted">{r.body}</div>}
                </td>
                <td className="px-4 py-3 text-text-muted">{productTitles[r.product_id] ?? `#${r.product_id}`}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status] ?? ''}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {r.status !== 'approved' && (
                      <button
                        onClick={() => act(r.id, 'approve')}
                        disabled={busyId === r.id}
                        title="Approve"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 text-green-600 hover:bg-green-50 disabled:opacity-50"
                      >
                        {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button
                        onClick={() => act(r.id, 'reject')}
                        disabled={busyId === r.id}
                        title="Reject"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:bg-surface disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => act(r.id, 'delete')}
                      disabled={busyId === r.id}
                      title="Delete"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
