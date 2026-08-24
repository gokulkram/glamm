'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import type { PaymentGatewayConfig } from '@/lib/settings'

export default function PaymentGatewayForm({
  initial,
  stripeConfigured,
  cloverConfigured,
}: {
  initial: PaymentGatewayConfig
  stripeConfigured: boolean
  cloverConfigured: boolean
}) {
  const router = useRouter()
  const [stripeEnabled, setStripeEnabled] = useState(initial.stripeEnabled)
  const [cloverEnabled, setCloverEnabled] = useState(initial.cloverEnabled)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    const res = await fetch('/api/admin/payment-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stripeEnabled, cloverEnabled }),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || 'Could not save' })
      return
    }
    setMsg({ ok: true, text: 'Payment settings saved' })
    router.refresh()
  }

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

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={stripeEnabled}
            onChange={(e) => setStripeEnabled(e.target.checked)}
            className="h-4 w-4 accent-[#f68961]"
          />
          Accept Stripe at checkout
          {!stripeConfigured && <span className="text-xs font-normal text-text-muted">(not configured — has no effect yet)</span>}
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={cloverEnabled}
            onChange={(e) => setCloverEnabled(e.target.checked)}
            className="h-4 w-4 accent-[#f68961]"
          />
          Accept Clover at checkout
          {!cloverConfigured && <span className="text-xs font-normal text-text-muted">(not configured — has no effect yet)</span>}
        </label>
      </div>

      <p className="text-xs text-text-muted">
        Turning a gateway off removes it from checkout immediately — customers still see pay on
        delivery if no gateway is available.
      </p>

      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save payment settings'}
      </button>
    </form>
  )
}
