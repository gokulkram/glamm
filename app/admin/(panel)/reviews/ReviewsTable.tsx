'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Star,
  Check,
  X,
  Trash2,
  Loader2,
  Search,
  ChevronUp,
  ChevronDown,
  GripVertical,
  ExternalLink,
} from 'lucide-react'
import type { Review, ReviewStatus } from '@/lib/reviews'
import Pagination from '@/components/admin/Pagination'
import { usePagination } from '@/components/admin/usePagination'

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

type DropTarget = { id: number; placement: 'before' | 'after' }

export default function ReviewsTable({
  reviews,
  products,
}: {
  reviews: Review[]
  products: Record<number, { title: string; slug: string }>
}) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<number | null>(null)
  const [movingId, setMovingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | ReviewStatus>('all')

  // Local copy of the review order so a drag can be applied optimistically.
  // Re-seeded whenever the server sends a fresh list (router.refresh()).
  const [items, setItems] = useState(reviews)
  const [syncedFrom, setSyncedFrom] = useState(reviews)
  if (reviews !== syncedFrom) {
    setSyncedFrom(reviews)
    setItems(reviews)
  }

  // Drag state. `armedId` is the row the grip has enabled dragging on — rows
  // aren't draggable by default so the action buttons and text selection keep
  // working.
  const [armedId, setArmedId] = useState<number | null>(null)
  const [dragId, setDragId] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  // Inline "move to position #" editor.
  const [editingPosId, setEditingPosId] = useState<number | null>(null)
  const [posValue, setPosValue] = useState('')
  const posInputRef = useRef<HTMLInputElement>(null)

  // Reordering acts on the whole list, so it only makes sense unfiltered.
  const isFiltered = search.trim() !== '' || status !== 'all'
  const total = items.length
  const canReorder = !isFiltered && movingId === null

  const pendingCount = useMemo(() => items.filter((r) => r.status === 'pending').length, [items])

  // Position by id — `items` is in sort_order, so index + 1 is the rank.
  const positionById = useMemo(() => {
    const m = new Map<number, number>()
    items.forEach((r, i) => m.set(r.id, i + 1))
    return m
  }, [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((r) => {
      if (status !== 'all' && r.status !== status) return false
      if (!q) return true
      return (
        r.author_name.toLowerCase().includes(q) ||
        (r.title ?? '').toLowerCase().includes(q) ||
        (r.body ?? '').toLowerCase().includes(q) ||
        (products[r.product_id]?.title ?? '').toLowerCase().includes(q)
      )
    })
  }, [items, search, status, products])

  const paging = usePagination(filtered)

  const clearDrag = () => {
    setArmedId(null)
    setDragId(null)
    setDropTarget(null)
  }

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

  /**
   * Show `nextItems` immediately, then persist the move. On failure the previous
   * order is put back, so the list never keeps an order the database rejected.
   * Only one reorder is ever in flight — the server renumbers by reading the
   * current order, so overlapping calls would fight each other.
   */
  const commitOrder = async (
    nextItems: Review[],
    body: Record<string, unknown>,
    reviewId: number,
  ): Promise<boolean> => {
    const previous = items
    setError(null)
    setItems(nextItems)
    setMovingId(reviewId)

    const res = await fetch('/api/admin/reviews/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setItems(previous)
      setError(data.error || 'Failed to reorder review')
      setMovingId(null)
      return false
    }

    setMovingId(null)
    router.refresh()
    return true
  }

  const handleMove = (review: Review, direction: 'up' | 'down') => {
    const from = items.findIndex((r) => r.id === review.id)
    const to = direction === 'up' ? from - 1 : from + 1
    if (from === -1 || to < 0 || to >= items.length) return
    const next = [...items]
    next.splice(to, 0, next.splice(from, 1)[0])
    return commitOrder(next, { id: review.id, direction }, review.id)
  }

  const handleDrop = (target: Review) => {
    const id = dragId
    const placement = dropTarget?.placement ?? 'before'
    clearDrag()
    if (id === null || id === target.id || !canReorder) return

    const dragged = items.find((r) => r.id === id)
    if (!dragged) return

    // Mirrors the server: pull the dragged row out first, then splice against
    // the target's position in what remains. That keeps dragging up and
    // dragging down landing in the same visual slot.
    const rest = items.filter((r) => r.id !== id)
    const targetIdx = rest.findIndex((r) => r.id === target.id)
    if (targetIdx === -1) return
    rest.splice(placement === 'before' ? targetIdx : targetIdx + 1, 0, dragged)

    return commitOrder(rest, { id, targetId: target.id, placement }, id)
  }

  const openPositionEditor = (review: Review) => {
    if (!canReorder) return
    setEditingPosId(review.id)
    setPosValue(String(positionById.get(review.id) ?? ''))
    // focus once the input has rendered
    requestAnimationFrame(() => posInputRef.current?.select())
  }

  const submitPosition = async (review: Review) => {
    const position = Number(posValue)
    setEditingPosId(null)
    if (!Number.isInteger(position) || position < 1 || position > total) {
      setError(`Enter a position between 1 and ${total}`)
      return
    }
    if (position === positionById.get(review.id)) return

    const rest = items.filter((r) => r.id !== review.id)
    rest.splice(position - 1, 0, review)

    // Follow the review to its new page, otherwise it just disappears.
    const previousPage = paging.page
    paging.setPage(Math.ceil(position / paging.rowsPerPage))
    const ok = await commitOrder(rest, { id: review.id, position }, review.id)
    if (!ok) paging.setPage(previousPage)
  }

  const reorderHint = isFiltered
    ? 'Clear the search & status filter to reorder'
    : movingId !== null
      ? 'Saving the previous move…'
      : undefined

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, review text, product…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        {pendingCount > 0 && status !== 'pending' && (
          <button
            onClick={() => setStatus('pending')}
            className="rounded-lg bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-200"
          >
            {pendingCount} pending
          </button>
        )}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'all' | ReviewStatus)}
          className="px-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent sm:w-44"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      {isFiltered && (
        <div className="bg-surface/70 border-b border-border px-4 py-2 text-xs text-text-muted">
          Reordering is off while the list is filtered — clear the search and status to drag rows.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium w-28" title="Display order — drag to reorder">
                #
              </th>
              <th className="px-4 py-3 font-medium">Review</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                  {items.length === 0 ? 'No reviews yet.' : 'No reviews match your filters.'}
                </td>
              </tr>
            )}
            {paging.pageItems.map((r) => {
              const position = positionById.get(r.id)
              const isDropBefore = dropTarget?.id === r.id && dropTarget.placement === 'before'
              const isDropAfter = dropTarget?.id === r.id && dropTarget.placement === 'after'
              return (
                <tr
                  key={r.id}
                  draggable={armedId === r.id}
                  onDragStart={(e) => {
                    if (!canReorder) return
                    setDragId(r.id)
                    e.dataTransfer.effectAllowed = 'move'
                    // Firefox refuses to start a drag without payload.
                    e.dataTransfer.setData('text/plain', String(r.id))
                  }}
                  onDragOver={(e) => {
                    if (dragId === null || dragId === r.id) return
                    e.preventDefault() // without this, onDrop never fires
                    e.dataTransfer.dropEffect = 'move'
                    const box = e.currentTarget.getBoundingClientRect()
                    const placement = e.clientY < box.top + box.height / 2 ? 'before' : 'after'
                    if (dropTarget?.id !== r.id || dropTarget.placement !== placement) {
                      setDropTarget({ id: r.id, placement })
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleDrop(r)
                  }}
                  onDragEnd={clearDrag}
                  className={[
                    'hover:bg-surface/50 align-top',
                    dragId === r.id ? 'opacity-40' : '',
                    // The indicator sits on the cells, not the row — `table`
                    // is border-collapse in preflight and drops row shadows.
                    isDropBefore ? '[&>td]:shadow-[inset_0_2px_0_0_theme(colors.accent)]' : '',
                    isDropAfter ? '[&>td]:shadow-[inset_0_-2px_0_0_theme(colors.accent)]' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        onPointerDown={() => canReorder && setArmedId(r.id)}
                        onPointerUp={() => setArmedId(null)}
                        title={reorderHint ?? 'Drag to reorder'}
                        aria-hidden="true"
                        className={
                          canReorder
                            ? 'cursor-grab text-text-muted hover:text-accent active:cursor-grabbing'
                            : 'cursor-not-allowed text-text-muted/30'
                        }
                      >
                        <GripVertical className="h-4 w-4" />
                      </span>

                      {editingPosId === r.id ? (
                        <input
                          ref={posInputRef}
                          type="number"
                          min={1}
                          max={total}
                          value={posValue}
                          autoFocus
                          onChange={(e) => setPosValue(e.target.value)}
                          onBlur={() => setEditingPosId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') submitPosition(r)
                            if (e.key === 'Escape') setEditingPosId(null)
                          }}
                          aria-label={`Move the review by ${r.author_name} to position`}
                          className="w-12 rounded border border-accent px-1 py-0.5 text-center text-xs tabular-nums outline-none focus:ring-2 focus:ring-accent/30"
                        />
                      ) : (
                        <button
                          onClick={() => openPositionEditor(r)}
                          disabled={!canReorder}
                          title={reorderHint ?? 'Move to position…'}
                          aria-label={`Position ${position}. Move to a position`}
                          className="w-8 rounded px-1 text-right tabular-nums text-text-muted hover:bg-surface hover:text-accent disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-text-muted"
                        >
                          {movingId === r.id ? (
                            <Loader2 className="ml-auto h-3 w-3 animate-spin" />
                          ) : (
                            position
                          )}
                        </button>
                      )}

                      <div className="flex flex-col">
                        <button
                          onClick={() => handleMove(r, 'up')}
                          disabled={!canReorder || position === 1}
                          title={reorderHint ?? 'Move up'}
                          aria-label="Move up"
                          className="flex h-4 w-5 items-center justify-center rounded text-text-muted hover:bg-surface hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(r, 'down')}
                          disabled={!canReorder || position === total}
                          title={reorderHint ?? 'Move down'}
                          aria-label="Move down"
                          className="flex h-4 w-5 items-center justify-center rounded text-text-muted hover:bg-surface hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-md">
                    <div className="flex items-center gap-2 mb-1">
                      <Stars n={r.rating} />
                      <span className="font-medium">{r.author_name}</span>
                    </div>
                    {r.title && <div className="font-medium">{r.title}</div>}
                    {r.body && <div className="text-text-muted">{r.body}</div>}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {products[r.product_id] ? (
                      <Link
                        href={`/products/${products[r.product_id].slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 hover:text-accent hover:underline underline-offset-2"
                      >
                        {products[r.product_id].title}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </Link>
                    ) : (
                      // A review whose product has since been deleted keeps its
                      // id so the row is still identifiable.
                      `#${r.product_id}`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status] ?? ''}`}
                    >
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
                          {busyId === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
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
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination {...paging.paginationProps} />
    </div>
  )
}
