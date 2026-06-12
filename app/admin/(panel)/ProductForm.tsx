'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react'
import type { Product, Category } from '@/lib/data'

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type SizeRow = { size: string; price: string }

export default function ProductForm({
  categories,
  initial,
}: {
  categories: Category[]
  initial?: Product
}) {
  const router = useRouter()
  const isEdit = !!initial

  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState(initial?.category ?? categories[0]?.name ?? '')
  const [image, setImage] = useState(initial?.image ?? '')
  const [badge, setBadge] = useState(initial?.badge ?? '')
  const [inStock, setInStock] = useState(initial?.inStock ?? true)
  const [sizeRows, setSizeRows] = useState<SizeRow[]>(
    initial && initial.sizes.length
      ? initial.sizes.map((s) => ({ size: s, price: String(initial.sizes_prices?.[s] ?? '') }))
      : [{ size: '', price: '' }],
  )
  const [featuresText, setFeaturesText] = useState((initial?.features ?? []).join('\n'))
  const [benefitsText, setBenefitsText] = useState((initial?.benefits ?? []).join('\n'))

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onTitleChange = (v: string) => {
    setTitle(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  const updateRow = (i: number, patch: Partial<SizeRow>) =>
    setSizeRows((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const addRow = () => setSizeRows((rows) => [...rows, { size: '', price: '' }])
  const removeRow = (i: number) => setSizeRows((rows) => rows.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const sizes: string[] = []
    const sizes_prices: Record<string, number> = {}
    for (const r of sizeRows) {
      const s = r.size.trim()
      if (!s) continue
      sizes.push(s)
      const p = Number(r.price)
      if (!isNaN(p)) sizes_prices[s] = p
    }

    const payload = {
      title,
      slug,
      description,
      category,
      image,
      badge,
      inStock,
      sizes,
      sizes_prices,
      features: featuresText.split('\n').map((l) => l.trim()).filter(Boolean),
      benefits: benefitsText.split('\n').map((l) => l.trim()).filter(Boolean),
    }

    setSaving(true)
    const res = await fetch(
      isEdit ? `/api/admin/products/${initial!.id}` : '/api/admin/products',
      {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setSaving(false)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  const field = 'w-full px-3 py-2 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-5">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Basics */}
        <div className="card p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input className={field} value={title} onChange={(e) => onTitleChange(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug *</label>
              <input
                className={field}
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugTouched(true)
                }}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea className={field} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category *</label>
              <select className={field} value={category} onChange={(e) => setCategory(e.target.value)} required>
                {categories.length === 0 && <option value="">No categories — create one first</option>}
                {categories.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Badge (optional)</label>
              <input className={field} value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. Best Seller" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Image path</label>
            <input className={field} value={image} onChange={(e) => setImage(e.target.value)} placeholder="/products/your-image.jpg" />
            <p className="text-xs text-text-muted mt-1">Path under /public for now (file uploads come later).</p>
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="h-4 w-4 accent-[#f68961]" />
            In stock
          </label>
        </div>

        {/* Sizes & prices */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold">Sizes & Prices</h2>
              <p className="text-xs text-text-muted">The price range shown on the site is taken from these.</p>
            </div>
            <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm text-accent font-medium">
              <Plus className="h-4 w-4" /> Add size
            </button>
          </div>
          <div className="space-y-2">
            {sizeRows.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className={field}
                  value={r.size}
                  onChange={(e) => updateRow(i, { size: e.target.value })}
                  placeholder={'Size (e.g. 18")'}
                />
                <div className="relative w-40">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                  <input
                    className={`${field} pl-7`}
                    type="number"
                    step="0.01"
                    value={r.price}
                    onChange={(e) => updateRow(i, { price: e.target.value })}
                    placeholder="Price"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  aria-label="Remove size"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Features & benefits */}
        <div className="card p-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Features</label>
            <textarea className={field} rows={5} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder="One per line" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Benefits</label>
            <textarea className={field} rows={5} value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} placeholder="One per line" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : isEdit ? 'Save changes' : 'Create product'}
          </button>
          <Link href="/admin" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  )
}
