'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Loader2 } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/account'
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    // 1) create the account
    const res = await fetch('/api/account/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || 'Could not create account')
      setLoading(false)
      return
    }
    // 2) sign in
    const supabase = createSupabaseBrowserClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (signInError) {
      // account created but sign-in failed → send to login
      router.replace(`/account/login?next=${encodeURIComponent(next)}`)
      return
    }
    router.replace(next)
    router.refresh()
  }

  const field =
    'w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

  return (
    <div className="section">
      <div className="container-max max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-text-muted text-sm mt-1">Track orders and check out faster</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">First name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                <input required value={form.firstName} onChange={set('firstName')} className={field} placeholder="Jane" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Last name</label>
              <input required value={form.lastName} onChange={set('lastName')} className="w-full px-4 py-3 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
              <input type="email" required value={form.email} onChange={set('email')} className={field} placeholder="you@email.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
              <input type="password" required minLength={6} value={form.password} onChange={set('password')} className={field} placeholder="At least 6 characters" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
          </button>
          <p className="text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link href={`/account/login?next=${encodeURIComponent(next)}`} className="text-accent font-medium hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function AccountRegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}
