'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import type { MyProfile } from '@/lib/account/data'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const field =
  'w-full px-3 py-2 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

export default function SettingsForm({ profile }: { profile: MyProfile }) {
  const router = useRouter()

  // ---- profile ----
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg(null)
    setSavingProfile(true)
    const res = await fetch('/api/account/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json().catch(() => ({}))
    setSavingProfile(false)
    if (!res.ok) {
      setProfileMsg({ ok: false, text: data.error || 'Could not save' })
      return
    }
    setProfileMsg({ ok: true, text: 'Profile updated' })
    router.refresh()
  }

  // ---- password ----
  const [pw, setPw] = useState({ next: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg(null)
    if (pw.next.length < 6) {
      setPwMsg({ ok: false, text: 'Password must be at least 6 characters' })
      return
    }
    if (pw.next !== pw.confirm) {
      setPwMsg({ ok: false, text: 'Passwords do not match' })
      return
    }
    setSavingPw(true)
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.updateUser({ password: pw.next })
    setSavingPw(false)
    if (error) {
      setPwMsg({ ok: false, text: error.message })
      return
    }
    setPw({ next: '', confirm: '' })
    setPwMsg({ ok: true, text: 'Password changed' })
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Profile */}
      <form onSubmit={saveProfile} className="card p-6 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        {profileMsg && (
          <div className={`rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${profileMsg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {profileMsg.ok && <Check className="h-4 w-4" />} {profileMsg.text}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input value={profile.email} disabled className={`${field} bg-surface text-text-muted`} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">First name</label>
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={field} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Last name</label>
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={field} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} />
        </div>
        <button type="submit" disabled={savingProfile} className="btn btn-primary">
          {savingProfile ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save changes'}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={changePassword} className="card p-6 space-y-4">
        <h2 className="font-semibold">Change password</h2>
        {pwMsg && (
          <div className={`rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${pwMsg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {pwMsg.ok && <Check className="h-4 w-4" />} {pwMsg.text}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">New password</label>
            <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className={field} placeholder="At least 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Confirm password</label>
            <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className={field} />
          </div>
        </div>
        <button type="submit" disabled={savingPw} className="btn btn-primary">
          {savingPw ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update password'}
        </button>
      </form>
    </div>
  )
}
