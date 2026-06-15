'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed']

export default function OrderManager({
  id,
  status,
  paymentStatus,
  trackingNumber,
  trackingCarrier,
}: {
  id: string
  status: string
  paymentStatus: string
  trackingNumber: string | null
  trackingCarrier: string | null
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    status,
    payment_status: paymentStatus,
    tracking_number: trackingNumber ?? '',
    tracking_carrier: trackingCarrier ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const field =
    'w-full px-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

  const save = async () => {
    setMsg(null)
    setSaving(true)
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || 'Could not update order' })
      return
    }
    setMsg({
      ok: true,
      text: data.shippingEmailed ? 'Saved — shipping email sent to customer' : 'Order updated',
    })
    router.refresh()
  }

  return (
    <div className="card p-5">
      <div className="font-semibold mb-3">Manage order</div>
      {msg && (
        <div className={`mb-3 rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.ok && <Check className="h-4 w-4" />} {msg.text}
        </div>
      )}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Order status</label>
          <select className={`${field} capitalize`} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Payment status</label>
          <select className={`${field} capitalize`} value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value })}>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Tracking number</label>
          <input className={field} value={form.tracking_number} onChange={(e) => setForm({ ...form, tracking_number: e.target.value })} placeholder="e.g. 1Z999AA10123456784" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Carrier</label>
          <input className={field} value={form.tracking_carrier} onChange={(e) => setForm({ ...form, tracking_carrier: e.target.value })} placeholder="e.g. DHL, USPS, FedEx" />
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary w-full">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save'}
        </button>
        <p className="text-xs text-text-muted">
          Setting status to <span className="font-medium">shipped</span> emails the customer their tracking number.
        </p>
      </div>
    </div>
  )
}
