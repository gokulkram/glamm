'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { CLAIM_STATUSES, CLAIM_STATUS_LABELS } from '@/lib/claims'

/**
 * Support's controls on a damage claim: move it through review and leave a
 * note the customer sees on their own order page.
 */
export default function ClaimManager({
  id,
  status,
  adminNote,
}: {
  id: string
  status: string
  adminNote: string | null
}) {
  const router = useRouter()
  const [form, setForm] = useState({ status, admin_note: adminNote ?? '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const field =
    'w-full px-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

  const save = async () => {
    setMsg(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || 'Could not update claim' })
        return
      }
      setMsg({ ok: true, text: 'Claim updated' })
      router.refresh()
    } catch {
      setMsg({ ok: false, text: 'Could not update claim — check your connection.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-5 space-y-3 border-t border-border pt-4">
      {msg && (
        <div
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm ${
            msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {msg.ok && <Check className="h-4 w-4" />}
          {msg.text}
        </div>
      )}

      <div>
        <label htmlFor="claim-status" className="mb-1.5 block text-sm font-medium">
          Claim status
        </label>
        <select
          id="claim-status"
          className={field}
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          {CLAIM_STATUSES.map((s) => (
            <option key={s} value={s}>
              {CLAIM_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="claim-note" className="mb-1.5 block text-sm font-medium">
          Note to customer
        </label>
        <textarea
          id="claim-note"
          className={`${field} min-h-[80px] resize-y`}
          value={form.admin_note}
          onChange={(e) => setForm({ ...form, admin_note: e.target.value })}
          placeholder="Shown to the customer on their order page."
        />
      </div>

      <button onClick={save} className="btn btn-primary" disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? 'Saving…' : 'Save claim'}
      </button>
    </div>
  )
}
