'use client'

import { useEffect, useState } from 'react'
import { Loader2, Check } from 'lucide-react'

type Source = 'saved' | 'environment' | 'none'
type TextField = { value: string; source: Source }
type SecretField = { set: boolean; source: Source }

type CloverCreds = {
  merchantId: TextField
  publicToken: TextField
  privateToken: SecretField
  mode: TextField
}
type StripeCreds = {
  publishableKey: TextField
  secretKey: SecretField
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

function saveGateway(gateway: 'stripe' | 'clover', fields: Record<string, string>) {
  return fetch('/api/admin/payment-credentials', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gateway, fields }),
  })
}

function StripeSection({ initial, onSaved }: { initial: StripeCreds; onSaved: () => void }) {
  const [publishableKey, setPublishableKey] = useState(initial.publishableKey.value)
  const [secretKey, setSecretKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    const res = await saveGateway('stripe', { publishableKey, secretKey })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || 'Could not save' })
      return
    }
    setSecretKey('')
    setMsg({ ok: true, text: 'Stripe credentials saved' })
    onSaved()
  }

  return (
    <form onSubmit={save} className="card p-6 max-w-xl space-y-6">
      <Banner msg={msg} />
      <div>
        <h3 className="font-medium mb-3">Stripe</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Publishable key</label>
              <SourceHint source={initial.publishableKey.source} />
            </div>
            <input
              type="text"
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder="pk_test_... or pk_live_..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Secret key</label>
              <SourceHint source={initial.secretKey.source} />
            </div>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder={initial.secretKey.set ? '••••••••  (leave blank to keep current)' : 'sk_test_... or sk_live_...'}
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-text-muted border-t border-border pt-4">
        The webhook secret isn&apos;t here — it&apos;s set via environment only (see Status above).
      </p>

      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Stripe credentials'}
      </button>
    </form>
  )
}

function CloverSection({ initial, onSaved }: { initial: CloverCreds; onSaved: () => void }) {
  const [merchantId, setMerchantId] = useState(initial.merchantId.value)
  const [publicToken, setPublicToken] = useState(initial.publicToken.value)
  const [privateToken, setPrivateToken] = useState('')
  const [mode, setMode] = useState<'sandbox' | 'production'>(initial.mode.value === 'production' ? 'production' : 'sandbox')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    const res = await saveGateway('clover', { merchantId, publicToken, privateToken, mode })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || 'Could not save' })
      return
    }
    setPrivateToken('')
    setMsg({ ok: true, text: 'Clover credentials saved' })
    onSaved()
  }

  return (
    <form onSubmit={save} className="card p-6 max-w-xl space-y-6">
      <Banner msg={msg} />
      <div>
        <h3 className="font-medium mb-3">Clover</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Merchant ID</label>
              <SourceHint source={initial.merchantId.source} />
            </div>
            <input
              type="text"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder="e.g. ABCD1234EFGH"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Public token</label>
              <SourceHint source={initial.publicToken.source} />
            </div>
            <input
              type="text"
              value={publicToken}
              onChange={(e) => setPublicToken(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Private token</label>
              <SourceHint source={initial.privateToken.source} />
            </div>
            <input
              type="password"
              value={privateToken}
              onChange={(e) => setPrivateToken(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder={initial.privateToken.set ? '••••••••  (leave blank to keep current)' : 'Not set'}
              autoComplete="off"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Mode</label>
              <SourceHint source={initial.mode.source} />
            </div>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'sandbox' | 'production')}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
            >
              <option value="sandbox">Sandbox (test)</option>
              <option value="production">Production (live)</option>
            </select>
          </div>
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Clover credentials'}
      </button>
    </form>
  )
}

export default function PaymentCredentialsForm() {
  const [stripe, setStripe] = useState<StripeCreds | null>(null)
  const [clover, setClover] = useState<CloverCreds | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/payment-credentials')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        setStripe(d.stripe)
        setClover(d.clover)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading || !stripe || !clover) {
    return (
      <div className="card p-6 max-w-xl flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-text-muted max-w-xl">
        Secret fields are write-only — the saved value is never shown again, and leaving one blank
        keeps whatever is currently set.
      </p>
      <StripeSection initial={stripe} onSaved={load} />
      <CloverSection initial={clover} onSaved={load} />
    </div>
  )
}
