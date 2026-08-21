'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import ImageDropzone from '@/components/admin/ImageDropzone'
import type { HeroContent, HeroStat } from '@/lib/content'

const field =
  'w-full px-3 py-2 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'
const labelCls = 'block text-sm font-medium mb-1.5'

/**
 * Module scope on purpose. Declared inside HeroForm this would be a fresh
 * component type on every render, so React would unmount and remount the input
 * on each keystroke and the caret would jump out after one character.
 */
function TextField({
  label, value, onChange, hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input className={field} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  )
}

/**
 * Editor for the homepage hero.
 *
 * Deliberately a plain form rather than a rich-text editor: the two heading
 * lines and the two subtitle lines are styled differently from each other, so
 * they have to stay separate fields to keep that styling.
 */
export default function HeroForm({ initial }: { initial: HeroContent }) {
  const router = useRouter()
  const [hero, setHero] = useState<HeroContent>(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const set = <K extends keyof HeroContent>(k: K, v: HeroContent[K]) =>
    setHero((h) => ({ ...h, [k]: v }))

  const setStat = (i: number, patch: Partial<HeroStat>) =>
    setHero((h) => ({
      ...h,
      stats: h.stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) as HeroContent['stats'],
    }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    const res = await fetch('/api/admin/hero', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hero),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || 'Could not save' })
      return
    }
    setMsg({ ok: true, text: 'Homepage hero saved' })
    router.refresh()
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
        <TextField label="Badge" value={hero.badge} onChange={(v) => set('badge', v)} hint="The small pill above the headline." />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Heading — first line" value={hero.headingTop} onChange={(v) => set('headingTop', v)} hint="Shown in white." />
          <TextField label="Heading — second line" value={hero.headingBottom} onChange={(v) => set('headingBottom', v)} hint="Shown in the gradient." />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Subtitle" value={hero.subtitle} onChange={(v) => set('subtitle', v)} />
          <TextField label="Subtitle — accent line" value={hero.subtitleAccent} onChange={(v) => set('subtitleAccent', v)} hint="The tinted line underneath." />
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold">Buttons</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Primary button" value={hero.primaryLabel} onChange={(v) => set('primaryLabel', v)} />
          <TextField label="Primary link" value={hero.primaryHref} onChange={(v) => set('primaryHref', v)} hint="A path like /shop, or a full https:// address." />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Secondary button" value={hero.secondaryLabel} onChange={(v) => set('secondaryLabel', v)} />
          <TextField label="Secondary link" value={hero.secondaryHref} onChange={(v) => set('secondaryHref', v)} hint="A path like /about, or a full https:// address." />
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold">Background</h2>
        <ImageDropzone
          label="Hero background image"
          value={hero.image}
          onChange={(url) => set('image', url)}
          endpoint="/api/admin/hero/upload"
          previewClassName="h-24 w-40"
          previewAlt="Hero background preview"
        />
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold">Trust badges</h2>
        <p className="text-text-muted text-sm -mt-3">
          The three figures under the buttons. Their icons are part of the design and stay fixed.
        </p>
        {hero.stats.map((stat, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Badge {i + 1} — figure</label>
              <input
                className={field}
                value={stat.value}
                onChange={(e) => setStat(i, { value: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Badge {i + 1} — caption</label>
              <input
                className={field}
                value={stat.label}
                onChange={(e) => setStat(i, { label: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold">Social proof</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Count" value={hero.socialCount} onChange={(v) => set('socialCount', v)} />
          <TextField label="Caption" value={hero.socialLabel} onChange={(v) => set('socialLabel', v)} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save changes'}
        </button>
        <a href="/" target="_blank" rel="noreferrer" className="text-sm text-text-muted hover:text-accent">
          View homepage
        </a>
      </div>
    </form>
  )
}
