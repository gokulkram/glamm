'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, MapPin } from 'lucide-react'
import { mapEmbedSrc, type ContactContent } from '@/lib/content'

const field =
  'w-full px-3 py-2 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'
const labelCls = 'block text-sm font-medium mb-1.5'

/**
 * Module scope on purpose. Declared inside the form this would be a fresh
 * component type on every render, so React would remount the input on each
 * keystroke and the caret would jump out after one character.
 */
function TextField({
  label,
  value,
  onChange,
  hint,
  textarea,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
  textarea?: boolean
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {textarea ? (
        <textarea
          className={`${field} min-h-[80px] resize-y`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input className={field} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  )
}

/** Editor for the contact page's copy and contact details. */
export default function ContactPageForm({ initial }: { initial: ContactContent }) {
  const router = useRouter()
  const [c, setC] = useState<ContactContent>(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const set = <K extends keyof ContactContent>(k: K, v: ContactContent[K]) =>
    setC((prev) => ({ ...prev, [k]: v }))

  // Debounced so the embedded map doesn't reload on every keystroke.
  const [previewAddress, setPreviewAddress] = useState({ line1: c.addressLine1, line2: c.addressLine2 })
  useEffect(() => {
    const t = setTimeout(() => setPreviewAddress({ line1: c.addressLine1, line2: c.addressLine2 }), 600)
    return () => clearTimeout(t)
  }, [c.addressLine1, c.addressLine2])
  const mapSrc = mapEmbedSrc(previewAddress.line1, previewAddress.line2)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    try {
      const res = await fetch('/api/admin/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || 'Could not save' })
        return
      }
      setMsg({ ok: true, text: 'Contact page saved' })
      router.refresh()
    } catch {
      setMsg({ ok: false, text: 'Could not save — check your connection.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-6">
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

      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold">Headline</h2>
        <TextField label="Eyebrow" value={c.eyebrow} onChange={(v) => set('eyebrow', v)} hint="The small pill above the heading." />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Heading — first line" value={c.headingTop} onChange={(v) => set('headingTop', v)} />
          <TextField label="Heading — second line" value={c.headingBottom} onChange={(v) => set('headingBottom', v)} hint="Shown in the gradient." />
        </div>
        <TextField label="Subtitle" value={c.subtitle} onChange={(v) => set('subtitle', v)} textarea />
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold">Contact details</h2>
        <p className="text-sm text-text-muted -mt-3">
          These fill the four cards near the top of the page.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Email card title" value={c.emailLabel} onChange={(v) => set('emailLabel', v)} />
          <TextField label="Email address" value={c.email} onChange={(v) => set('email', v)} hint="Just the address — the mailto: link is added for you." />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Phone card title" value={c.phoneLabel} onChange={(v) => set('phoneLabel', v)} />
          <TextField label="Phone number" value={c.phone} onChange={(v) => set('phone', v)} hint="Written however you want it shown — the tel: link is added for you." />
        </div>
        <TextField label="Address card title" value={c.addressLabel} onChange={(v) => set('addressLabel', v)} />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Address — line 1" value={c.addressLine1} onChange={(v) => set('addressLine1', v)} />
          <TextField label="Address — line 2" value={c.addressLine2} onChange={(v) => set('addressLine2', v)} />
        </div>
        <p className="text-xs text-text-muted -mt-2">
          The address is shown twice — in its card and under the map — and drives both the map preview
          below and the &quot;view on Google Maps&quot; link on the page.
        </p>
        <div>
          <label className={labelCls}>Map preview</label>
          <div className="rounded-lg overflow-hidden border border-border">
            {mapSrc ? (
              <iframe
                key={mapSrc}
                src={mapSrc}
                title="Map preview"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-video w-full border-0"
              />
            ) : (
              <div className="aspect-video bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="text-text-muted text-sm">Add an address to preview the map</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Hours card title" value={c.hoursLabel} onChange={(v) => set('hoursLabel', v)} />
          <TextField label="Opening hours" value={c.hours} onChange={(v) => set('hours', v)} />
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold">Follow us</h2>
        <TextField label="Heading" value={c.socialHeading} onChange={(v) => set('socialHeading', v)} />
        <TextField label="Blurb" value={c.socialBlurb} onChange={(v) => set('socialBlurb', v)} textarea />
        <TextField label="Instagram" value={c.instagramHref} onChange={(v) => set('instagramHref', v)} hint="A full https:// address." />
        <TextField label="Facebook" value={c.facebookHref} onChange={(v) => set('facebookHref', v)} />
        <TextField label="X / Twitter" value={c.twitterHref} onChange={(v) => set('twitterHref', v)} />
      </div>

      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
