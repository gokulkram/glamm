'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import type { ProductContent } from '@/lib/content'
import RichTextEditor from '@/components/admin/RichTextEditor'

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
        {/* No upload route for product content, so the editor hides its image
            button rather than offering an upload with nowhere to go. */}
        <RichTextEditor
          value={care}
          onChange={setCare}
          contentClass="product-content"
          minHeightClass="min-h-[16rem]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Shipping &amp; Returns</label>
        <RichTextEditor
          value={shipping}
          onChange={setShipping}
          contentClass="product-content"
          minHeightClass="min-h-[16rem]"
        />
      </div>
      <p className="text-xs text-text-muted">
        Shows on every product&apos;s Hair Care and Shipping &amp; Returns tabs.
      </p>

      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save content'}
      </button>
    </form>
  )
}
