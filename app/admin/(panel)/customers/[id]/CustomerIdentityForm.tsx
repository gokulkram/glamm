'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Pencil, Check, X } from 'lucide-react'

const field =
  'w-full px-3 py-2 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

/**
 * Inline edit for a customer's name and phone.
 *
 * Email is shown but not editable — orders are matched to a customer by email,
 * so changing it would detach their order history.
 */
export default function CustomerIdentityForm({
  id,
  name,
  firstName,
  lastName,
  phoneOnRecord,
  email,
  since,
}: {
  id: string
  name: string
  firstName: string
  lastName: string
  phoneOnRecord: string
  email: string
  since: string
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ firstName, lastName, phone: phoneOnRecord })

  const open = () => {
    setError(null)
    setForm({ firstName, lastName, phone: phoneOnRecord })
    setEditing(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const res = await fetch(`/api/admin/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'Could not save')
      return
    }
    setEditing(false)
    router.refresh()
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{name}</h1>
          <button
            onClick={open}
            aria-label="Edit name and phone"
            title="Edit name and phone"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted hover:bg-surface hover:text-accent"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        <p className="text-text-muted text-sm">Customer since {since}</p>
      </div>
    )
  }

  return (
    <form onSubmit={save} className="w-full max-w-xl">
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">First name</label>
          <input
            autoFocus
            className={field}
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Last name</label>
          <input
            className={field}
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Phone</label>
          <input
            className={field}
            value={form.phone}
            placeholder="Not set"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={saving}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-text-muted hover:bg-surface"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
        <span className="text-xs text-text-muted">
          {email} — email can&apos;t change here; orders are matched to it.
        </span>
      </div>
    </form>
  )
}
