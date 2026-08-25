'use client'

import { useEffect, useState } from 'react'
import { Loader2, Check } from 'lucide-react'

type Source = 'saved' | 'environment' | 'none'
type TextField = { value: string; source: Source }
type SecretField = { set: boolean; source: Source }

type MailCreds = {
  host: TextField
  port: TextField
  user: TextField
  from: TextField
  pass: SecretField
  notify: TextField
}

/** Small "using environment / using saved value" hint next to a field. */
function SourceHint({ source }: { source: Source }) {
  if (source === 'none') return <span className="text-xs text-text-muted">Not set</span>
  return (
    <span className="text-xs text-text-muted">
      {source === 'saved' ? 'Using saved value' : 'Using environment value'}
    </span>
  )
}

function Banner({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null
  return (
    <div
      className={`rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${
        msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
      }`}
    >
      {msg.ok && <Check className="h-4 w-4" />} {msg.text}
    </div>
  )
}

function saveCredentials(fields: Record<string, string>) {
  return fetch('/api/admin/mail-credentials', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  })
}

function CredentialsSection({ initial, onSaved }: { initial: MailCreds; onSaved: () => void }) {
  const [host, setHost] = useState(initial.host.value)
  const [port, setPort] = useState(initial.port.value)
  const [user, setUser] = useState(initial.user.value)
  const [from, setFrom] = useState(initial.from.value)
  const [pass, setPass] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    const res = await saveCredentials({ host, port, user, from, pass })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || 'Could not save' })
      return
    }
    setPass('')
    setMsg({ ok: true, text: 'Mail credentials saved' })
    onSaved()
  }

  return (
    <form onSubmit={save} className="card p-6 max-w-xl space-y-6">
      <Banner msg={msg} />
      <div>
        <h3 className="font-medium mb-3">SMTP</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Host</label>
              <SourceHint source={initial.host.source} />
            </div>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder="smtp.gmail.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Port</label>
              <SourceHint source={initial.port.source} />
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder="465"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">User</label>
              <SourceHint source={initial.user.source} />
            </div>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder="you@gmail.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Password</label>
              <SourceHint source={initial.pass.source} />
            </div>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder={initial.pass.set ? '••••••••  (leave blank to keep current)' : 'App password'}
              autoComplete="off"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">From</label>
              <SourceHint source={initial.from.source} />
            </div>
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder="Glamm Hair <you@gmail.com>"
            />
          </div>
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save mail credentials'}
      </button>
    </form>
  )
}

function NotifyEmailsSection({ initial, onSaved }: { initial: TextField; onSaved: () => void }) {
  // Only pre-fill from a saved override — pre-filling from the env fallback
  // would mean saving the untouched field freezes ADMIN_EMAILS's current
  // value into the DB forever, silently ignoring any future env change.
  const [notify, setNotify] = useState(initial.source === 'saved' ? initial.value : '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    const res = await saveCredentials({ notify })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || 'Could not save' })
      return
    }
    setMsg({ ok: true, text: 'Notify emails saved' })
    onSaved()
  }

  return (
    <form onSubmit={save} className="card p-6 max-w-xl space-y-4">
      <div>
        <h3 className="font-medium mb-1">Order & contact notifications</h3>
        <p className="text-text-muted text-sm">
          Who receives new order, contact form, and damage claim alerts. Comma-separated. Leave
          blank to use environment values.
        </p>
      </div>
      <Banner msg={msg} />
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium">Notify emails</label>
          <SourceHint source={initial.source} />
        </div>
        <input
          type="text"
          value={notify}
          onChange={(e) => setNotify(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm"
          placeholder={initial.source === 'environment' ? initial.value : 'staff@glammhair.com, orders@glammhair.com'}
        />
      </div>
      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save notify emails'}
      </button>
    </form>
  )
}

function TestEmailSection() {
  const [to, setTo] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setSending(true)
    const res = await fetch('/api/admin/mail-credentials/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to }),
    })
    const data = await res.json().catch(() => ({}))
    setSending(false)
    setMsg(res.ok ? { ok: true, text: `Test email sent to ${to || 'your account email'}` } : { ok: false, text: data.error || 'Could not send test email' })
  }

  return (
    <form onSubmit={send} className="card p-6 max-w-xl space-y-4">
      <div>
        <h3 className="font-medium mb-1">Send test email</h3>
        <p className="text-text-muted text-sm">
          Sends a real email using the settings above (saved values, or environment if nothing&apos;s
          saved) so you can confirm SMTP actually works.
        </p>
      </div>
      <Banner msg={msg} />
      <div className="flex gap-2">
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="flex-1 px-3 py-2 border border-border rounded-lg text-sm"
          placeholder="Leave blank to send to your own email"
        />
        <button type="submit" disabled={sending} className="btn btn-secondary whitespace-nowrap">
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send test email'}
        </button>
      </div>
    </form>
  )
}

export default function MailCredentialsForm() {
  const [creds, setCreds] = useState<MailCreds | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/mail-credentials')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        setCreds(d)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading || !creds) {
    return (
      <div className="card p-6 max-w-xl flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-text-muted max-w-xl">
        The password field is write-only — the saved value is never shown again, and leaving it
        blank keeps whatever is currently set.
      </p>
      <CredentialsSection initial={creds} onSaved={load} />
      <NotifyEmailsSection initial={creds.notify} onSaved={load} />
      <TestEmailSection />
    </div>
  )
}
