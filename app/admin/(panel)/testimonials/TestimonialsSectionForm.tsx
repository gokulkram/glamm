'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import type { TestimonialsSection } from '@/lib/content'

export default function TestimonialsSectionForm({ initial }: { initial: TestimonialsSection }) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const set = (patch: Partial<TestimonialsSection>) => setForm({ ...form, ...patch })

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    const res = await fetch('/api/admin/testimonials/section', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || 'Could not save' })
      return
    }
    setMsg({ ok: true, text: 'Section heading saved' })
    router.refresh()
  }

  const field =
    'w-full px-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

  return (
    <form onSubmit={save} className="card p-6 space-y-4">
      {msg && (
        <div
          className={`rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${
            msg.ok
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {msg.ok && <Check className="h-4 w-4" />} {msg.text}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1.5">Eyebrow</label>
          <input value={form.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} maxLength={120} className={field} />
          <p className="text-xs text-text-muted mt-1">Small line above the heading.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Heading</label>
          <input value={form.heading} onChange={(e) => set({ heading: e.target.value })} maxLength={120} className={field} required />
          <p className="text-xs text-text-muted mt-1">The big title, e.g. What Our Customers Say.</p>
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save heading'}
      </button>
    </form>
  )
}
