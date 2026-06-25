'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import type { ProductContent } from '@/lib/content'

export default function ProductContentForm({ initial }: { initial: ProductContent }) {
  const router = useRouter()
  const [care, setCare] = useState(initial.care)
  const [shipping, setShipping] = useState(initial.shipping)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    const res = await fetch('/api/admin/product-content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ care, shipping }),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || 'Could not save' })
      return
    }
    setMsg({ ok: true, text: 'Product content saved' })
    router.refresh()
  }

  const area =
    'w-full px-3 py-2 rounded-lg border border-border bg-white text-sm font-mono outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

  return (
    <form onSubmit={save} className="card p-6 max-w-3xl space-y-5">
      {msg && (
        <div
          className={`rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${
            msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {msg.ok && <Check className="h-4 w-4" />} {msg.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5">Hair Care Instructions</label>
        <textarea className={area} rows={12} value={care} onChange={(e) => setCare(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Shipping &amp; Returns</label>
        <textarea className={area} rows={12} value={shipping} onChange={(e) => setShipping(e.target.value)} required />
      </div>
      <p className="text-xs text-text-muted">
        Formatting: <code>## </code> starts a heading, lines starting with <code>- </code> become checklist items, and
        blank lines separate paragraphs. Shows on every product&apos;s Hair Care and Shipping &amp; Returns tabs.
      </p>

      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save content'}
      </button>
    </form>
  )
}
