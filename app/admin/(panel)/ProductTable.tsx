'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Pencil,
  Trash2,
  Loader2,
  Search,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react'
import type { Product, Category } from '@/lib/data'
import Pagination from '@/components/admin/Pagination'
import { usePagination } from '@/components/admin/usePagination'

type DropTarget = { id: number; placement: 'before' | 'after' }

export default function ProductTable({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [movingId, setMovingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')


  // Local copy of the catalog order so a drag can be applied optimistically.
  // Re-seeded whenever the server sends a fresh list (router.refresh()).
  const [items, setItems] = useState(products)
  const [syncedFrom, setSyncedFrom] = useState(products)
  if (products !== syncedFrom) {
    setSyncedFrom(products)
    setItems(products)
  }

  // Drag state. `armedId` is the row the grip has enabled dragging on — rows
  // aren't draggable by default so the Edit/Delete buttons and text selection
  // keep working.
  const [armedId, setArmedId] = useState<number | null>(null)
  const [dragId, setDragId] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  // Inline "move to position #" editor.
  const [editingPosId, setEditingPosId] = useState<number | null>(null)
  const [posValue, setPosValue] = useState('')
  const posInputRef = useRef<HTMLInputElement>(null)

  // Reordering acts on the full catalog order, so it only makes sense when the
  // list isn't filtered down to a subset.
  const isFiltered = search.trim() !== '' || category !== 'all'
  const total = items.length
  const canReorder = !isFiltered && movingId === null

  // Catalog position by id — `items` is in sort_order, so index + 1 is the rank.
  const positionById = useMemo(() => {
    const m = new Map<number, number>()
    items.forEach((p, i) => m.set(p.id, i + 1))
    return m
  }, [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    })
  }, [items, search, category])

  const paging = usePagination(filtered)
  const { page: currentPage, pageItems, rowsPerPage, setPage } = paging

  // reset to page 1 whenever filters change
  const resetAnd = (fn: () => void) => {
    fn()
    setPage(1)
  }

  const clearDrag = () => {
    setArmedId(null)
    setDragId(null)
    setDropTarget(null)
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return
    setError(null)
    setDeletingId(product.id)
    const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Failed to delete product')
      setDeletingId(null)
      return
    }
    setDeletingId(null)
    router.refresh()
  }

  /**
   * Show `nextItems` immediately, then persist the move. On failure the previous
   * order is put back, so the list never keeps an order the database rejected.
   * Only one reorder is ever in flight — the server renumbers by reading the
   * current order, so overlapping calls would fight each other.
   */
  const commitOrder = async (
    nextItems: Product[],
    body: Record<string, unknown>,
    productId: number,
  ): Promise<boolean> => {
    const previous = items
    setError(null)
    setItems(nextItems)
    setMovingId(productId)

    const res = await fetch('/api/admin/products/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setItems(previous)
      setError(data.error || 'Failed to reorder product')
      setMovingId(null)
      return false
    }

    setMovingId(null)
    router.refresh()
    return true
  }

  const handleMove = (product: Product, direction: 'up' | 'down') => {
    const from = items.findIndex((p) => p.id === product.id)
    const to = direction === 'up' ? from - 1 : from + 1
    if (from === -1 || to < 0 || to >= items.length) return
    const next = [...items]
    next.splice(to, 0, next.splice(from, 1)[0])
    return commitOrder(next, { id: product.id, direction }, product.id)
  }

  const handleDrop = (target: Product) => {
    const id = dragId
    const placement = dropTarget?.placement ?? 'before'
    clearDrag()
    if (id === null || id === target.id || !canReorder) return

    const dragged = items.find((p) => p.id === id)
    if (!dragged) return

    // Mirrors the server: pull the dragged row out first, then splice against
    // the target's position in what remains. That keeps dragging up and
    // dragging down landing in the same visual slot.
    const rest = items.filter((p) => p.id !== id)
    const targetIdx = rest.findIndex((p) => p.id === target.id)
    if (targetIdx === -1) return
    rest.splice(placement === 'before' ? targetIdx : targetIdx + 1, 0, dragged)

    return commitOrder(rest, { id, targetId: target.id, placement }, id)
  }

  const openPositionEditor = (product: Product) => {
    if (!canReorder) return
    setEditingPosId(product.id)
    setPosValue(String(positionById.get(product.id) ?? ''))
    // focus once the input has rendered
    requestAnimationFrame(() => posInputRef.current?.select())
  }

  const submitPosition = async (product: Product) => {
    const position = Number(posValue)
    setEditingPosId(null)
    if (!Number.isInteger(position) || position < 1 || position > total) {
      setError(`Enter a position between 1 and ${total}`)
      return
    }
    if (position === positionById.get(product.id)) return

    const rest = items.filter((p) => p.id !== product.id)
    rest.splice(position - 1, 0, product)

    // Follow the product to the page it landed on, otherwise it just
    // disappears — and come back if the save is rejected.
    const previousPage = currentPage
    setPage(Math.ceil(position / rowsPerPage))
    const ok = await commitOrder(rest, { id: product.id, position }, product.id)
    if (!ok) setPage(previousPage)
  }

  const reorderHint = isFiltered
    ? 'Clear search & category filter to reorder'
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
            onChange={(e) => resetAnd(() => setSearch(e.target.value))}
            placeholder="Search by name, slug, category…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <select
          value={category}
          onChange={(e) => resetAnd(() => setCategory(e.target.value))}
          className="px-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent sm:w-52"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {isFiltered && (
        <div className="bg-surface/70 border-b border-border px-4 py-2 text-xs text-text-muted">
          Reordering is off while the list is filtered — clear the search and category to drag rows.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium w-28" title="Catalog position — drag to reorder">
                #
              </th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Visibility</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-text-muted">
                  No products match your filters.
                </td>
              </tr>
            )}
            {pageItems.map((p) => {
              const position = positionById.get(p.id)
              const isDropBefore = dropTarget?.id === p.id && dropTarget.placement === 'before'
              const isDropAfter = dropTarget?.id === p.id && dropTarget.placement === 'after'
              return (
                <tr
                  key={p.id}
                  draggable={armedId === p.id}
                  onDragStart={(e) => {
                    if (!canReorder) return
                    setDragId(p.id)
                    e.dataTransfer.effectAllowed = 'move'
                    // Firefox refuses to start a drag without payload.
                    e.dataTransfer.setData('text/plain', String(p.id))
                  }}
                  onDragOver={(e) => {
                    if (dragId === null || dragId === p.id) return
                    e.preventDefault() // without this, onDrop never fires
                    e.dataTransfer.dropEffect = 'move'
                    const box = e.currentTarget.getBoundingClientRect()
                    const placement = e.clientY < box.top + box.height / 2 ? 'before' : 'after'
                    if (dropTarget?.id !== p.id || dropTarget.placement !== placement) {
                      setDropTarget({ id: p.id, placement })
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleDrop(p)
                  }}
                  onDragEnd={clearDrag}
                  className={[
                    'hover:bg-surface/50',
                    dragId === p.id ? 'opacity-40' : '',
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
                        onPointerDown={() => canReorder && setArmedId(p.id)}
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

                      {editingPosId === p.id ? (
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
                            if (e.key === 'Enter') submitPosition(p)
                            if (e.key === 'Escape') setEditingPosId(null)
                          }}
                          aria-label={`Move ${p.title} to position`}
                          className="w-12 rounded border border-accent px-1 py-0.5 text-center text-xs tabular-nums outline-none focus:ring-2 focus:ring-accent/30"
                        />
                      ) : (
                        <button
                          onClick={() => openPositionEditor(p)}
                          disabled={!canReorder}
                          title={reorderHint ?? 'Move to position…'}
                          aria-label={`Position ${position}. Move to a position`}
                          className="w-8 rounded px-1 text-right tabular-nums text-text-muted hover:bg-surface hover:text-accent disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-text-muted"
                        >
                          {movingId === p.id ? (
                            <Loader2 className="ml-auto h-3 w-3 animate-spin" />
                          ) : (
                            position
                          )}
                        </button>
                      )}

                      <div className="flex flex-col">
                        <button
                          onClick={() => handleMove(p, 'up')}
                          disabled={!canReorder || position === 1}
                          title={reorderHint ?? 'Move up'}
                          aria-label="Move up"
                          className="flex h-4 w-5 items-center justify-center rounded text-text-muted hover:bg-surface hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(p, 'down')}
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface">
                        {p.image && (
                          <Image src={p.image} alt={p.title} fill className="object-cover" unoptimized />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{p.title}</div>
                        <div className="text-xs text-text-muted">{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{p.category}</td>
                  <td className="px-4 py-3">
                    ${p.priceMin}
                    {p.priceMax !== p.priceMin && <span className="text-text-muted"> – ${p.priceMax}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {p.inStock ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        In stock
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Out
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        <Eye className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        <EyeOff className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        aria-label="Delete"
                      >
                        {deletingId === p.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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
