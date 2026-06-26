'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { Coupon } from '@/lib/coupons'

const toDateInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : '')

export default function DiscountForm({ initial }: { initial?: Coupon }) {
  const router = useRouter()
  const isEdit = !!initial

  const [code, setCode] = useState(initial?.code ?? '')
  const [type, setType] = useState<'percent' | 'fixed'>(initial?.type ?? 'percent')
  const [value, setValue] = useState(initial ? String(initial.value) : '')
  const [minSubtotal, setMinSubtotal] = useState(initial?.minSubtotal ? String(initial.minSubtotal) : '')
  const [active, setActive] = useState(initial?.active ?? true)
  const [startsAt, setStartsAt] = useState(toDateInput(initial?.startsAt ?? null))
  const [expiresAt, setExpiresAt] = useState(toDateInput(initial?.expiresAt ?? null))
  const [maxRedemptions, setMaxRedemptions] = useState(
    initial?.maxRedemptions != null ? String(initial.maxRedemptions) : '',
  )
  const [oncePerCustomer, setOncePerCustomer] = useState((initial?.perCustomerLimit ?? 1) >= 1)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const payload = {
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minSubtotal: minSubtotal ? Number(minSubtotal) : 0,
      active,
      startsAt: startsAt || null,
      expiresAt: expiresAt || null,
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
      perCustomerLimit: oncePerCustomer ? 1 : 0,
    }
    setSaving(true)
    const res = await fetch(isEdit ? `/api/admin/coupons/${initial!.id}` : '/api/admin/coupons', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setSaving(false)
      return
    }
    router.push('/admin/discounts')
    router.refresh()
  }

  const field =
    'w-full px-3 py-2 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <Link href="/admin/discounts" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to discounts
      </Link>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Discount' : 'Add Discount'}</h1>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-5">{error}</div>
      )}

      <div className="card p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Code *</label>
            <input
              className={`${field} font-mono uppercase`}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="WELCOME10"
              required
            />
            <p className="mt-1 text-xs text-text-muted">Customers type this at checkout. Letters, numbers, - and _.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Type *</label>
              <select className={field} value={type} onChange={(e) => setType(e.target.value as 'percent' | 'fixed')}>
                <option value="percent">% off</option>
                <option value="fixed">$ off</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Value *</label>
              <div className="relative">
                {type === 'fixed' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>}
                <input
                  className={`${field} ${type === 'fixed' ? 'pl-7' : ''}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === 'percent' ? '10' : '15.00'}
                  required
                />
                {type === 'percent' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">%</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Minimum spend (optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
              <input
                className={`${field} pl-7`}
                type="number"
                step="0.01"
                min="0"
                value={minSubtotal}
                onChange={(e) => setMinSubtotal(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">Cart subtotal required to use the code.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Total usage limit (optional)</label>
            <input
              className={field}
              type="number"
              step="1"
              min="1"
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              placeholder="Unlimited"
            />
            <p className="mt-1 text-xs text-text-muted">Max times this code can be used in total.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Starts (optional)</label>
            <input className={field} type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Expires (optional)</label>
            <input className={field} type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[#f68961]" />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={oncePerCustomer} onChange={(e) => setOncePerCustomer(e.target.checked)} className="h-4 w-4 accent-[#f68961]" />
            Limit to once per customer
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : isEdit ? 'Save changes' : 'Create discount'}
        </button>
        <Link href="/admin/discounts" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  )
}
