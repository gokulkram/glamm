'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Loader2, MapPin, Star } from 'lucide-react'
import type { Address } from '@/lib/account/data'

const field =
  'w-full px-3 py-2 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

type FormState = {
  first_name: string
  last_name: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
}

const empty: FormState = {
  first_name: '', last_name: '', phone: '', address1: '', address2: '',
  city: '', state: '', zip: '', country: 'US',
}

function toForm(a: Address): FormState {
  return {
    first_name: a.first_name ?? '', last_name: a.last_name ?? '', phone: a.phone ?? '',
    address1: a.address1 ?? '', address2: a.address2 ?? '', city: a.city ?? '',
    state: a.state ?? '', zip: a.zip ?? '', country: a.country ?? 'US',
  }
}

export default function AddressManager({ initial }: { initial: Address[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(empty)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const startAdd = () => { setEditId(null); setForm(empty); setError(null); setOpen(true) }
  const startEdit = (a: Address) => { setEditId(a.id); setForm(toForm(a)); setError(null); setOpen(true) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.address1.trim()) { setError('Street address is required'); return }
    setError(null)
    setSaving(true)
    const res = await fetch(
      editId ? `/api/account/addresses/${editId}` : '/api/account/addresses',
      { method: editId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) },
    )
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Could not save address'); return }
    setOpen(false)
    router.refresh()
  }

  const setDefault = async (a: Address) => {
    setBusyId(a.id)
    await fetch(`/api/account/addresses/${a.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_default: true }),
    })
    setBusyId(null)
    router.refresh()
  }

  const remove = async (a: Address) => {
    if (!confirm('Delete this address?')) return
    setBusyId(a.id)
    await fetch(`/api/account/addresses/${a.id}`, { method: 'DELETE' })
    setBusyId(null)
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Saved addresses</h2>
        {!open && (
          <button onClick={startAdd} className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" /> Add address
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={submit} className="card p-6 space-y-4 mb-6">
          <h3 className="font-medium">{editId ? 'Edit address' : 'New address'}</h3>
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div className="grid sm:grid-cols-2 gap-4">
            <input value={form.first_name} onChange={set('first_name')} className={field} placeholder="First name" />
            <input value={form.last_name} onChange={set('last_name')} className={field} placeholder="Last name" />
          </div>
          <input value={form.phone} onChange={set('phone')} className={field} placeholder="Phone" />
          <input value={form.address1} onChange={set('address1')} className={field} placeholder="Street address" />
          <input value={form.address2} onChange={set('address2')} className={field} placeholder="Apartment, suite (optional)" />
          <div className="grid grid-cols-3 gap-4">
            <input value={form.city} onChange={set('city')} className={field} placeholder="City" />
            <input value={form.state} onChange={set('state')} className={field} placeholder="State" />
            <input value={form.zip} onChange={set('zip')} className={field} placeholder="ZIP" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editId ? 'Save' : 'Add address'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {initial.length === 0 && !open ? (
        <div className="card p-10 text-center text-text-muted">
          <MapPin className="mx-auto h-10 w-10 opacity-30 mb-3" />
          No saved addresses yet.
        </div>
      ) : (
        <div className="space-y-3">
          {initial.map((a) => (
            <div key={a.id} className="card p-4 flex items-start justify-between gap-4">
              <div className="text-sm">
                <div className="flex items-center gap-2 font-medium">
                  {`${a.first_name ?? ''} ${a.last_name ?? ''}`.trim() || 'Address'}
                  {a.is_default && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 text-accent px-2 py-0.5 text-xs font-medium">
                      <Star className="h-3 w-3 fill-accent" /> Default
                    </span>
                  )}
                </div>
                <div className="text-text-muted mt-1 leading-relaxed">
                  {a.address1}{a.address2 ? `, ${a.address2}` : ''}<br />
                  {[a.city, a.state, a.zip].filter(Boolean).join(', ')}{a.country ? `, ${a.country}` : ''}
                  {a.phone && <><br />{a.phone}</>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!a.is_default && (
                  <button onClick={() => setDefault(a)} disabled={busyId === a.id} className="text-xs text-accent font-medium hover:underline disabled:opacity-50">
                    Set default
                  </button>
                )}
                <button onClick={() => startEdit(a)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-surface" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(a)} disabled={busyId === a.id} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50" aria-label="Delete">
                  {busyId === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
