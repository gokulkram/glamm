'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import type { AdminCategory } from '@/lib/products'

export default function CategoryManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setAdding(true)
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const data = await res.json().catch(() => ({}))
    setAdding(false)
    if (!res.ok) {
      setError(data.error || 'Could not add category')
      return
    }
    setName('')
    router.refresh()
  }

  const handleDelete = async (cat: AdminCategory) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return
    setError(null)
    setDeletingId(cat.id)
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    setDeletingId(null)
    if (!res.ok) {
      setError(data.error || 'Could not delete category')
      return
    }
    router.refresh()
  }

  return (
    <div className="max-w-xl space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleAdd} className="card p-5 flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1.5">New category</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ponytails"
            className="w-full px-3 py-2 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <button type="submit" disabled={adding} className="btn btn-primary">
          {adding ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-4 w-4" /> Add</>}
        </button>
      </form>

      <div className="card divide-y divide-border">
        {categories.length === 0 && (
          <div className="p-6 text-center text-text-muted text-sm">No categories yet.</div>
        )}
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-text-muted">
                {c.slug} · {c.count} product{c.count === 1 ? '' : 's'}
              </div>
            </div>
            <button
              onClick={() => handleDelete(c)}
              disabled={deletingId === c.id}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
              aria-label={`Delete ${c.name}`}
            >
              {deletingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
