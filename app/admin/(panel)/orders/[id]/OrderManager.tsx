'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, FileText, Upload, X } from 'lucide-react'
import type { SignedShippingFile } from '@/lib/shippingFiles'

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed']
// Mirrors app/api/admin/orders/[id]/route.ts and lib/shippingFiles.ts — the
// server re-validates, these just make an obviously-wrong input fail
// instantly instead of after a round trip.
const MAX_PACKAGE_DETAILS = 2000
const MAX_FILES = 10
const FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
const FILE_MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export default function OrderManager({
  id,
  status,
  paymentStatus,
  trackingNumber,
  trackingCarrier,
  trackingUrl,
  packageDetails,
  shippingFiles,
}: {
  id: string
  status: string
  paymentStatus: string
  trackingNumber: string | null
  trackingCarrier: string | null
  trackingUrl: string | null
  packageDetails: string | null
  shippingFiles: SignedShippingFile[]
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    status,
    payment_status: paymentStatus,
    tracking_number: trackingNumber ?? '',
    tracking_carrier: trackingCarrier ?? '',
    tracking_url: trackingUrl ?? '',
    package_details: packageDetails ?? '',
  })
  const [files, setFiles] = useState<SignedShippingFile[]>(shippingFiles)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const field =
    'w-full px-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

  const filesFull = files.length >= MAX_FILES

  const handlePickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!picked.length || uploading) return

    const room = MAX_FILES - files.length
    if (room <= 0) {
      setMsg({ ok: false, text: `You can attach up to ${MAX_FILES} files.` })
      return
    }
    const batch = picked.slice(0, room)
    setMsg(null)
    setUploading(true)
    try {
      for (const file of batch) {
        if (!FILE_TYPES.includes(file.type)) {
          setMsg({ ok: false, text: 'Unsupported file type. Use JPG, PNG, WebP, GIF or PDF.' })
          continue
        }
        if (file.size > FILE_MAX_BYTES) {
          setMsg({ ok: false, text: `That file is too large (max ${Math.round(FILE_MAX_BYTES / (1024 * 1024))} MB).` })
          continue
        }
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(`/api/admin/orders/${id}/files`, { method: 'POST', body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setMsg({ ok: false, text: data.error || 'Upload failed' })
          continue
        }
        setFiles((prev) => [...prev, { path: data.path, url: data.url, kind: data.kind }])
      }
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (path: string) => {
    // Only removes it from the list to save — the file itself isn't deleted
    // from storage here, since it may already be persisted on the order.
    setFiles((prev) => prev.filter((f) => f.path !== path))
  }

  const save = async () => {
    setMsg(null)
    setSaving(true)
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, shipping_files: files.map((f) => f.path) }),
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
          <label className="block text-xs font-medium text-text-muted mb-1">Carrier</label>
          <input className={field} value={form.tracking_carrier} onChange={(e) => setForm({ ...form, tracking_carrier: e.target.value })} placeholder="e.g. DHL, USPS, FedEx" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Tracking number</label>
          <input className={field} value={form.tracking_number} onChange={(e) => setForm({ ...form, tracking_number: e.target.value })} placeholder="e.g. 1Z999AA10123456784" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Tracking URL</label>
          <input className={field} value={form.tracking_url} onChange={(e) => setForm({ ...form, tracking_url: e.target.value })} placeholder="https://…" />
        </div>

        <div className="border-t border-border pt-3">
          <label className="block text-xs font-medium text-text-muted mb-1">
            Package details <span className="font-normal">(admin only — not shown to customer)</span>
          </label>
          <textarea
            className={`${field} min-h-[70px] resize-y`}
            value={form.package_details}
            maxLength={MAX_PACKAGE_DETAILS}
            onChange={(e) => setForm({ ...form, package_details: e.target.value })}
            placeholder="Weight, dimensions, box count — for support reference"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Shipping label / package files <span className="font-normal">(admin only)</span>
          </label>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {files.map((f) => (
                <div key={f.path} className="relative">
                  {f.kind === 'photo' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.url ?? ''} alt="Package file" className="h-16 w-16 rounded-lg border border-border object-cover bg-surface" />
                  ) : (
                    <a
                      href={f.url ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-surface text-text-muted hover:text-accent hover:border-accent"
                    >
                      <FileText className="h-5 w-5" />
                      <span className="text-[10px]">View</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(f.path)}
                    aria-label="Remove file"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-white text-text-muted shadow-sm hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label
            className={`btn btn-secondary inline-flex text-sm ${uploading || filesFull ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Uploading…' : 'Add files'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
              multiple
              className="hidden"
              onChange={handlePickFiles}
              disabled={uploading || filesFull}
            />
          </label>
        </div>

        <button onClick={save} disabled={saving || uploading} className="btn btn-primary w-full">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save'}
        </button>
        <p className="text-xs text-text-muted">
          Setting status to <span className="font-medium">shipped</span>, or adding a tracking number to an
          already-shipped order, emails the customer their tracking details — only once.
        </p>
      </div>
    </div>
  )
}
