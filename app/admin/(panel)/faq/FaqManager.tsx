'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GripVertical, Pencil, Trash2, Eye, EyeOff, Plus, Loader2, Check, X, ChevronUp, ChevronDown } from 'lucide-react'
import { FAQ_CATEGORIES, type Faq, type FaqCategory } from '@/lib/faq'

const field =
  'w-full px-3 py-2 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

const CATEGORY_LABELS: Record<FaqCategory, string> = {
  products: 'Products',
  shipping: 'Orders & Shipping',
  care: 'Care & Styling',
  returns: 'Returns',
}

type Draft = { question: string; answer: string; category: FaqCategory }

const EMPTY: Draft = { question: '', answer: '', category: 'products' }

function DraftFields({
  draft, onChange, disabled,
}: {
  draft: Draft
  onChange: (d: Draft) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-[1fr_200px] gap-3">
        <input
          className={field}
          placeholder="Question"
          value={draft.question}
          disabled={disabled}
          onChange={(e) => onChange({ ...draft, question: e.target.value })}
        />
        <select
          className={field}
          value={draft.category}
          disabled={disabled}
          onChange={(e) => onChange({ ...draft, category: e.target.value as FaqCategory })}
        >
          {FAQ_CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>
      <textarea
        className={field}
        rows={4}
        placeholder="Answer"
        value={draft.answer}
        disabled={disabled}
        onChange={(e) => onChange({ ...draft, answer: e.target.value })}
      />
      <p className="text-xs text-text-muted">
        Write <code>{'{{freeThreshold}}'}</code> or <code>{'{{standardRate}}'}</code> in an answer to
        show the current shipping settings.
      </p>
    </div>
  )
}

export default function FaqManager({ initial, tableMissing }: { initial: Faq[]; tableMissing: boolean }) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [addDraft, setAddDraft] = useState<Draft>(EMPTY)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY)
  const [dragId, setDragId] = useState<number | null>(null)

  const json = (body: unknown, method: string) => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const run = async (url: string, init: RequestInit, id: number | null) => {
    setError(null)
    setBusyId(id)
    const res = await fetch(url, init)
    const data = await res.json().catch(() => ({}))
    setBusyId(null)
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      return false
    }
    router.refresh()
    return true
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (await run('/api/admin/faq', json(addDraft, 'POST'), null)) {
      setAddDraft(EMPTY)
      setAdding(false)
    }
  }

  const saveEdit = async (f: Faq) => {
    if (await run(`/api/admin/faq/${f.id}`, json(editDraft, 'PATCH'), f.id)) setEditingId(null)
  }

  const toggle = (f: Faq) =>
    run(`/api/admin/faq/${f.id}`, json({ is_active: !f.is_active }, 'PATCH'), f.id)

  const remove = (f: Faq) => {
    if (!confirm(`Delete "${f.question}"?`)) return
    return run(`/api/admin/faq/${f.id}`, { method: 'DELETE' }, f.id)
  }

  /**
   * Show the new order straight away, then persist it. On failure the previous
   * order goes back — the server renumbers from the current order, so a failed
   * move must not leave the list looking like it worked.
   */
  const commitOrder = async (next: Faq[], body: Record<string, unknown>, id: number) => {
    const previous = items
    setError(null)
    setItems(next)
    setBusyId(id)
    const res = await fetch('/api/admin/faq/reorder', json(body, 'POST'))
    setBusyId(null)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setItems(previous)
      setError(data.error || 'Could not reorder')
      return
    }
    router.refresh()
  }

  const move = (f: Faq, direction: 'up' | 'down') => {
    const from = items.findIndex((x) => x.id === f.id)
    const to = direction === 'up' ? from - 1 : from + 1
    if (from === -1 || to < 0 || to >= items.length) return
    const next = [...items]
    next.splice(to, 0, next.splice(from, 1)[0])
    return commitOrder(next, { id: f.id, direction }, f.id)
  }

  const drop = (target: Faq) => {
    const id = dragId
    setDragId(null)
    if (id === null || id === target.id) return
    const dragged = items.find((x) => x.id === id)
    if (!dragged) return
    // Mirrors the server: pull the dragged row out first, then splice against
    // the target's position in what remains, so dragging up and dragging down
    // land in the same visual slot.
    const rest = items.filter((x) => x.id !== id)
    const targetIdx = rest.findIndex((x) => x.id === target.id)
    if (targetIdx === -1) return
    rest.splice(targetIdx, 0, dragged)
    return commitOrder(rest, { id, targetId: target.id, placement: 'before' }, id)
  }

  return (
    <div className="space-y-5">
      {tableMissing && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <strong>The faqs table doesn&apos;t exist yet.</strong> These are the questions built into
          the site. Run <code>supabase/faq.sql</code> in Supabase → SQL Editor to start editing them
          — it seeds this exact list, so nothing on /faq changes when you do.
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {adding ? (
        <form onSubmit={create} className="card p-5 space-y-3">
          <h2 className="font-semibold">New question</h2>
          <DraftFields draft={addDraft} onChange={setAddDraft} disabled={busyId === null && false} />
          <div className="flex items-center gap-2">
            <button type="submit" className="btn btn-primary">Add question</button>
            <button
              type="button"
              onClick={() => { setAdding(false); setAddDraft(EMPTY) }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-text-muted hover:bg-surface"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} disabled={tableMissing} className="btn btn-primary disabled:opacity-50">
          <Plus className="h-4 w-4" /> Add question
        </button>
      )}

      <div className="card divide-y divide-border">
        {items.length === 0 && (
          <div className="p-6 text-center text-text-muted text-sm">No questions yet.</div>
        )}
        {items.map((f, i) => (
          <div
            key={f.id}
            onDragOver={(e) => {
              if (dragId === null) return
              e.preventDefault() // without this, onDrop never fires
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={(e) => { e.preventDefault(); drop(f) }}
            className={`px-4 py-3 ${dragId === f.id ? 'opacity-50' : ''} ${f.is_active ? '' : 'bg-surface/60'}`}
          >
            {editingId === f.id ? (
              <div className="space-y-3">
                <DraftFields draft={editDraft} onChange={setEditDraft} disabled={busyId === f.id} />
                <div className="flex items-center gap-2">
                  <button onClick={() => saveEdit(f)} disabled={busyId === f.id} className="btn btn-primary">
                    {busyId === f.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-text-muted hover:bg-surface"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div
                  draggable={!tableMissing}
                  onDragStart={(e) => { setDragId(f.id); e.dataTransfer.effectAllowed = 'move' }}
                  onDragEnd={() => setDragId(null)}
                  title={tableMissing ? 'Run supabase/faq.sql first' : 'Drag to reorder'}
                  className={`mt-1 text-text-muted ${tableMissing ? 'opacity-30' : 'cursor-grab active:cursor-grabbing'}`}
                >
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5 mt-0.5">
                  <button onClick={() => move(f, 'up')} disabled={i === 0 || tableMissing} className="text-text-muted hover:text-accent disabled:opacity-25" aria-label="Move up">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => move(f, 'down')} disabled={i === items.length - 1 || tableMissing} className="text-text-muted hover:text-accent disabled:opacity-25" aria-label="Move down">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-accent uppercase tracking-wider">
                    {CATEGORY_LABELS[f.category]}
                    {!f.is_active && <span className="ml-2 text-text-muted">· hidden</span>}
                  </div>
                  <div className="font-medium">{f.question}</div>
                  <p className="text-sm text-text-muted line-clamp-2">{f.answer}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => toggle(f)}
                    disabled={busyId === f.id || tableMissing}
                    aria-label={f.is_active ? 'Hide question' : 'Show question'}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:bg-surface hover:text-accent disabled:opacity-50"
                  >
                    {busyId === f.id ? <Loader2 className="h-4 w-4 animate-spin" /> : f.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => { setEditingId(f.id); setEditDraft({ question: f.question, answer: f.answer, category: f.category }) }}
                    disabled={tableMissing}
                    aria-label="Edit question"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:bg-surface hover:text-accent disabled:opacity-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(f)}
                    disabled={busyId === f.id || tableMissing}
                    aria-label="Delete question"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
