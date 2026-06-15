'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, CheckCircle } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false) // recovery session detected
  const [checked, setChecked] = useState(false)
  const [pw, setPw] = useState({ next: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // The email link returns here with a recovery code/token; the browser client
  // exchanges it on load and fires PASSWORD_RECOVERY (or a session exists).
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
      setChecked(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
      setChecked(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (pw.next.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (pw.next !== pw.confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.updateUser({ password: pw.next })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setDone(true)
    setTimeout(() => {
      router.replace('/account')
      router.refresh()
    }, 1500)
  }

  const field =
    'w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

  return (
    <div className="section">
      <div className="container-max max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Set a new password</h1>
        </div>

        {done ? (
          <div className="card p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h2 className="font-semibold mb-1">Password updated</h2>
            <p className="text-sm text-text-muted">Taking you to your account…</p>
          </div>
        ) : checked && !ready ? (
          <div className="card p-8 text-center">
            <p className="text-text-muted mb-4">
              This reset link is invalid or has expired.
            </p>
            <Link href="/account/forgot-password" className="btn btn-primary inline-flex">Request a new link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">New password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                <input type="password" required value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className={field} placeholder="At least 6 characters" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                <input type="password" required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className={field} placeholder="Re-enter password" />
              </div>
            </div>
            <button type="submit" disabled={loading || !ready} className="btn btn-primary w-full">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update password'}
            </button>
            {!ready && <p className="text-center text-xs text-text-muted">Verifying your reset link…</p>}
          </form>
        )}
      </div>
    </div>
  )
}
