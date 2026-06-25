'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import type { ShippingConfig } from '@/lib/checkout/shipping'

export default function ShippingSettingsForm({ initial }: { initial: ShippingConfig }) {
  const router = useRouter()
  const [freeThreshold, setFreeThreshold] = useState(String(initial.freeThreshold))
  const [standardRate, setStandardRate] = useState(String(initial.standardRate))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    const res = await fetch('/api/admin/shipping', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ freeThreshold: Number(freeThreshold), standardRate: Number(standardRate) }),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || 'Could not save' })
      return
    }
    setMsg({ ok: true, text: 'Shipping settings saved' })
    router.refresh()
  }

  const field =
    'w-full pl-7 pr-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

  return (
    <form onSubmit={save} className="card p-6 max-w-xl space-y-4">
      {msg && (
        <div
          className={`rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${
            msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {msg.ok && <Check className="h-4 w-4" />} {msg.text}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Free shipping at ($)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
            <input type="number" min="0" step="0.01" className={field} value={freeThreshold} onChange={(e) => setFreeThreshold(e.target.value)} required />
          </div>
          <p className="text-xs text-text-muted mt-1">Orders at/above this subtotal ship free.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Standard rate ($)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
            <input type="number" min="0" step="0.01" className={field} value={standardRate} onChange={(e) => setStandardRate(e.target.value)} required />
          </div>
          <p className="text-xs text-text-muted mt-1">Flat shipping charged below the threshold.</p>
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save shipping'}
      </button>
    </form>
  )
}
