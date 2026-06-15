'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/account/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  return (
    <div className="section">
      <div className="container-max max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Reset your password</h1>
          <p className="text-text-muted text-sm mt-1">We&apos;ll email you a link to set a new password</p>
        </div>

        {sent ? (
          <div className="card p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h2 className="font-semibold mb-2">Check your email</h2>
            <p className="text-sm text-text-muted">
              If an account exists for <span className="font-medium">{email}</span>, we&apos;ve sent a password
              reset link. Click it to choose a new password.
            </p>
            <Link href="/account/login" className="btn btn-secondary mt-6 inline-flex">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                  placeholder="you@email.com"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send reset link'}
            </button>
            <p className="text-center text-sm text-text-muted">
              Remembered it?{' '}
              <Link href="/account/login" className="text-accent font-medium hover:underline">Log in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
