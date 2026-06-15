'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, LayoutDashboard, ShoppingBag, Settings, MapPin } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function AccountMenu() {
  const router = useRouter()
  const [name, setName] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    const apply = (user: { email?: string; user_metadata?: { first_name?: string } } | null | undefined) => {
      if (user) {
        setLoggedIn(true)
        setName(user.user_metadata?.first_name || user.email?.split('@')[0] || 'Account')
      } else {
        setLoggedIn(false)
        setName(null)
      }
    }
    supabase.auth.getSession().then(({ data: { session } }) => apply(session?.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => apply(session?.user))
    return () => sub.subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await createSupabaseBrowserClient().auth.signOut()
    setLoggedIn(false)
    setName(null)
    router.replace('/')
    router.refresh()
  }

  // Logged out → simple icon linking to login
  if (!loggedIn) {
    return (
      <Link href="/account" className="relative p-2 hover:text-accent transition-colors" aria-label="Account">
        <User className="w-6 h-6" />
      </Link>
    )
  }

  // Logged in → name + hover dropdown
  return (
    <div className="relative group">
      <Link href="/account" className="flex items-center gap-1.5 p-2 hover:text-accent transition-colors">
        <User className="w-6 h-6" />
        <span className="hidden sm:inline text-sm font-medium max-w-[110px] truncate">{name}</span>
      </Link>

      {/* pt-2 bridges the gap so hover stays active between icon and menu */}
      <div className="absolute right-0 top-full pt-2 w-52 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-150 z-50">
        <div className="rounded-xl border border-border bg-white shadow-large py-2 overflow-hidden">
          <div className="px-4 pb-2 mb-1 border-b border-border">
            <p className="text-xs text-text-muted">Signed in as</p>
            <p className="text-sm font-medium truncate">{name}</p>
          </div>
          <Link href="/account" className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-surface transition-colors">
            <LayoutDashboard className="w-4 h-4 text-text-muted" /> My Account
          </Link>
          <Link href="/account/orders" className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-surface transition-colors">
            <ShoppingBag className="w-4 h-4 text-text-muted" /> My Orders
          </Link>
          <Link href="/account/addresses" className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-surface transition-colors">
            <MapPin className="w-4 h-4 text-text-muted" /> Addresses
          </Link>
          <Link href="/account/settings" className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-surface transition-colors">
            <Settings className="w-4 h-4 text-text-muted" /> Settings
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-border mt-1"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </div>
    </div>
  )
}
