'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Trash2,
  Loader2,
  Pencil,
  Check,
  X,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react'
import type { Testimonial } from '@/lib/testimonials'
import StarPicker from './StarPicker'
import Pagination from '@/components/admin/Pagination'
import { usePagination } from '@/components/admin/usePagination'

type DropTarget = { id: number; placement: 'before' | 'after' }
type Draft = { headline: string; quote: string; initial: string; rating: number }

const EMPTY: Draft = { headline: '', quote: '', initial: '', rating: 5 }

const field =
  'w-full px-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

export default function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  // Set when a write half-landed (see `send`) — the row saved, one field didn't.
  const [warning, setWarning] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [movingId, setMovingId] = useState<number | null>(null)

  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY)

  // Local copy of the order so a drag can be applied optimistically.
  // Re-seeded whenever the server sends a fresh list (router.refresh()).
  const [items, setItems] = useState(testimonials)
  const [syncedFrom, setSyncedFrom] = useState(testimonials)
  if (testimonials !== syncedFrom) {
    setSyncedFrom(testimonials)
    setItems(testimonials)
  }

  // `armedId` is the row the grip has enabled dragging on — rows aren't
  // draggable by default so the buttons and text selection keep working.
  const [armedId, setArmedId] = useState<number | null>(null)
  const [dragId, setDragId] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  // Inline "move to position #" editor.
  const [editingPosId, setEditingPosId] = useState<number | null>(null)
  const [posValue, setPosValue] = useState('')
  const posInputRef = useRef<HTMLInputElement>(null)

  const total = items.length
  const canReorder = movingId === null && editingId === null

  const positionById = useMemo(() => {
    const m = new Map<number, number>()
    items.forEach((t, i) => m.set(t.id, i + 1))
    return m
  }, [items])

  const paging = usePagination(items)

  const clearBanners = () => {
    setError(null)
    setWarning(null)
  }

  const clearDrag = () => {
    setArmedId(null)
    setDragId(null)
    setDropTarget(null)
  }

  const json = (body: unknown, method: string): RequestInit => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  /**
   * Returns whether the write landed. A successful response can still carry a
   * `warning` — part of the row saved, part didn't (a rating with no column to
   * put it in) — which goes in the same banner so it can't pass unnoticed.
   */
  const send = async (url: string, init: RequestInit, fallback: string): Promise<boolean> => {
    const res = await fetch(url, init)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || fallback)
      return false
    }
    if (data.warning) setWarning(data.warning)
    return true
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.headline.trim() || !draft.quote.trim()) {
      setError('A headline and a quote are both required')
      return
    }
    clearBanners()
    setAdding(true)
    const ok = await send('/api/admin/testimonials', json(draft, 'POST'), 'Could not add the testimonial')
    setAdding(false)
    if (!ok) return
    setDraft(EMPTY)
    router.refresh()
  }

  const startEdit = (t: Testimonial) => {
    setEditingId(t.id)
    setEditDraft({ headline: t.headline, quote: t.quote, initial: t.initial, rating: t.rating })
  }

  const saveEdit = async (t: Testimonial) => {
    if (!editDraft.headline.trim() || !editDraft.quote.trim()) {
      setError('A headline and a quote are both required')
      return
    }
    clearBanners()
    setBusyId(t.id)
    const ok = await send(
      `/api/admin/testimonials/${t.id}`,
      json(editDraft, 'PATCH'),
      'Could not save the testimonial',
    )
    setBusyId(null)
    if (!ok) return
    setEditingId(null)
    router.refresh()
  }

  const toggleActive = async (t: Testimonial) => {
    clearBanners()
    setBusyId(t.id)
    const ok = await send(
      `/api/admin/testimonials/${t.id}`,
      json({ is_active: !t.is_active }, 'PATCH'),
      'Could not update the testimonial',
    )
    setBusyId(null)
    if (ok) router.refresh()
  }

  const remove = async (t: Testimonial) => {
    if (!confirm(`Delete "${t.headline}"?`)) return
    clearBanners()
    setBusyId(t.id)
    const ok = await send(`/api/admin/testimonials/${t.id}`, { method: 'DELETE' }, 'Could not delete the testimonial')
    setBusyId(null)
    if (ok) router.refresh()
  }

  /**
   * Show `nextItems` immediately, then persist the move. On failure the
   * previous order is put back. Only one reorder is ever in flight — the
   * server renumbers by reading the current order, so overlapping calls would
   * fight each other.
   */
  const commitOrder = async (nextItems: Testimonial[], body: Record<string, unknown>, id: number) => {
    const previous = items
    clearBanners()
    setItems(nextItems)
    setMovingId(id)

    const res = await fetch('/api/admin/testimonials/reorder', json(body, 'POST'))
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setItems(previous)
      setError(data.error || 'Failed to reorder')
      setMovingId(null)
      return
    }
    setMovingId(null)
    router.refresh()
  }

  const handleMove = (t: Testimonial, direction: 'up' | 'down') => {
    const from = items.findIndex((x) => x.id === t.id)
    const to = direction === 'up' ? from - 1 : from + 1
    if (from === -1 || to < 0 || to >= items.length) return
    const next = [...items]
    next.splice(to, 0, next.splice(from, 1)[0])
    return commitOrder(next, { id: t.id, direction }, t.id)
  }

  const handleDrop = (target: Testimonial) => {
    const id = dragId
    const placement = dropTarget?.placement ?? 'before'
    clearDrag()
    if (id === null || id === target.id || !canReorder) return

    const dragged = items.find((x) => x.id === id)
    if (!dragged) return

    // Mirrors the server: pull the dragged row out first, then splice against
    // the target's position in what remains, so dragging up and dragging down
    // land in the same visual slot.
    const rest = items.filter((x) => x.id !== id)
    const targetIdx = rest.findIndex((x) => x.id === target.id)
    if (targetIdx === -1) return
    rest.splice(placement === 'before' ? targetIdx : targetIdx + 1, 0, dragged)

    return commitOrder(rest, { id, targetId: target.id, placement }, id)
  }

  const openPositionEditor = (t: Testimonial) => {
    if (!canReorder) return
    setEditingPosId(t.id)
    setPosValue(String(positionById.get(t.id) ?? ''))
    // focus once the input has rendered
    requestAnimationFrame(() => posInputRef.current?.select())
  }

  const submitPosition = async (t: Testimonial) => {
    const position = Number(posValue)
    setEditingPosId(null)
    if (!Number.isInteger(position) || position < 1 || position > total) {
      setError(`Enter a position between 1 and ${total}`)
      return
    }
    if (position === positionById.get(t.id)) return

    const rest = items.filter((x) => x.id !== t.id)
    rest.splice(position - 1, 0, t)
    // Follow the testimonial to its new page, otherwise it just disappears.
    paging.setPage(Math.ceil(position / paging.rowsPerPage))
    await commitOrder(rest, { id: t.id, position }, t.id)
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      {warning && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          Saved, but not all of it: {warning}
        </div>
      )}

      {/* Add */}
      <form onSubmit={handleAdd} className="card p-5 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_5rem]">
          <div>
            <label className="block text-sm font-medium mb-1.5">Headline</label>
            <input
              value={draft.headline}
              onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
              placeholder="e.g. Best hair I’ve ever bought!"
              maxLength={120}
              className={field}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Initial</label>
            <input
              value={draft.initial}
              onChange={(e) => setDraft({ ...draft, initial: e.target.value })}
              placeholder="B"
              maxLength={1}
              className={`${field} text-center uppercase`}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Quote</label>
          <textarea
            value={draft.quote}
            onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
            placeholder="Soft, full, and zero shedding. I’m obsessed."
            rows={2}
            maxLength={400}
            className={field}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Rating</label>
          <StarPicker value={draft.rating} onChange={(rating) => setDraft({ ...draft, rating })} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={adding} className="btn btn-primary">
            {adding ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add testimonial
              </>
            )}
          </button>
          <span className="text-xs text-text-muted">
            Added to the end of the carousel — drag it where you want it.
          </span>
        </div>
      </form>

      {/* List */}
      <div className="card divide-y divide-border overflow-hidden">
        {items.length === 0 && (
          <div className="p-8 text-center text-sm text-text-muted">
            No testimonials yet. Add one above — until then the homepage shows the ten it shipped with.
          </div>
        )}

        {paging.pageItems.map((t) => {
          const position = positionById.get(t.id)
          const isDropBefore = dropTarget?.id === t.id && dropTarget.placement === 'before'
          const isDropAfter = dropTarget?.id === t.id && dropTarget.placement === 'after'
          const isEditing = editingId === t.id
          return (
            <div
              key={t.id}
              draggable={armedId === t.id}
              onDragStart={(e) => {
                if (!canReorder) return
                setDragId(t.id)
                e.dataTransfer.effectAllowed = 'move'
                // Firefox refuses to start a drag without payload.
                e.dataTransfer.setData('text/plain', String(t.id))
              }}
              onDragOver={(e) => {
                if (dragId === null || dragId === t.id) return
                e.preventDefault() // without this, onDrop never fires
                e.dataTransfer.dropEffect = 'move'
                const box = e.currentTarget.getBoundingClientRect()
                const placement = e.clientY < box.top + box.height / 2 ? 'before' : 'after'
                if (dropTarget?.id !== t.id || dropTarget.placement !== placement) {
                  setDropTarget({ id: t.id, placement })
                }
              }}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(t)
              }}
              onDragEnd={clearDrag}
              className={[
                'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface/50',
                dragId === t.id ? 'opacity-40' : '',
                isDropBefore ? 'shadow-[inset_0_2px_0_0_theme(colors.accent)]' : '',
                isDropAfter ? 'shadow-[inset_0_-2px_0_0_theme(colors.accent)]' : '',
                t.is_active ? '' : 'bg-surface/40',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* Order controls */}
              <div className="flex items-center gap-1.5 pt-1">
                <span
                  onPointerDown={() => canReorder && setArmedId(t.id)}
                  onPointerUp={() => setArmedId(null)}
                  title={canReorder ? 'Drag to reorder' : 'Finish the current change first'}
                  aria-hidden="true"
                  className={
                    canReorder
                      ? 'cursor-grab text-text-muted hover:text-accent active:cursor-grabbing'
                      : 'cursor-not-allowed text-text-muted/30'
                  }
                >
                  <GripVertical className="h-4 w-4" />
                </span>

                {editingPosId === t.id ? (
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
                      if (e.key === 'Enter') submitPosition(t)
                      if (e.key === 'Escape') setEditingPosId(null)
                    }}
                    aria-label={`Move "${t.headline}" to position`}
                    className="w-12 rounded border border-accent px-1 py-0.5 text-center text-xs tabular-nums outline-none focus:ring-2 focus:ring-accent/30"
                  />
                ) : (
                  <button
                    onClick={() => openPositionEditor(t)}
                    disabled={!canReorder}
                    title="Move to position…"
                    aria-label={`Position ${position}. Move to a position`}
                    className="w-8 rounded px-1 text-right text-sm tabular-nums text-text-muted hover:bg-surface hover:text-accent disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-text-muted"
                  >
                    {movingId === t.id ? <Loader2 className="ml-auto h-3 w-3 animate-spin" /> : position}
                  </button>
                )}

                <div className="flex flex-col">
                  <button
                    onClick={() => handleMove(t, 'up')}
                    disabled={!canReorder || position === 1}
                    aria-label="Move up"
                    title="Move up"
                    className="flex h-4 w-5 items-center justify-center rounded text-text-muted hover:bg-surface hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(t, 'down')}
                    disabled={!canReorder || position === total}
                    aria-label="Move down"
                    title="Move down"
                    className="flex h-4 w-5 items-center justify-center rounded text-text-muted hover:bg-surface hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Avatar */}
              <div className="mt-0.5 hidden rounded-full bg-gradient-to-br from-accent to-[#febf6b] p-[2px] sm:block">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-accent">
                  {t.initial || t.headline.slice(0, 1).toUpperCase()}
                </div>
              </div>

              {/* Body */}
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-[1fr_5rem]">
                      <input
                        value={editDraft.headline}
                        onChange={(e) => setEditDraft({ ...editDraft, headline: e.target.value })}
                        maxLength={120}
                        aria-label="Headline"
                        className={field}
                      />
                      <input
                        value={editDraft.initial}
                        onChange={(e) => setEditDraft({ ...editDraft, initial: e.target.value })}
                        maxLength={1}
                        aria-label="Initial"
                        className={`${field} text-center uppercase`}
                      />
                    </div>
                    <textarea
                      value={editDraft.quote}
                      onChange={(e) => setEditDraft({ ...editDraft, quote: e.target.value })}
                      rows={2}
                      maxLength={400}
                      aria-label="Quote"
                      className={field}
                    />
                    <StarPicker
                      value={editDraft.rating}
                      onChange={(rating) => setEditDraft({ ...editDraft, rating })}
                      size="h-4 w-4"
                    />
                  </div>
                ) : (
                  <>
                    <StarPicker value={t.rating} readOnly size="h-3.5 w-3.5" />
                    <div className="mt-0.5 font-medium">{t.headline}</div>
                    <div className="text-sm text-text-muted">&ldquo;{t.quote}&rdquo;</div>
                    {!t.is_active && (
                      <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Hidden
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => saveEdit(t)}
                      disabled={busyId === t.id}
                      title="Save"
                      aria-label="Save"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 text-green-600 hover:bg-green-50 disabled:opacity-50"
                    >
                      {busyId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      title="Cancel"
                      aria-label="Cancel"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:bg-surface"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => toggleActive(t)}
                      disabled={busyId === t.id}
                      title={t.is_active ? 'Hide from the homepage' : 'Show on the homepage'}
                      aria-label={t.is_active ? 'Hide from the homepage' : 'Show on the homepage'}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:bg-surface disabled:opacity-50"
                    >
                      {busyId === t.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : t.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(t)}
                      title="Edit"
                      aria-label="Edit"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:bg-surface"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(t)}
                      disabled={busyId === t.id}
                      title="Delete"
                      aria-label="Delete"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}

        <Pagination {...paging.paginationProps} />
      </div>
    </div>
  )
}
