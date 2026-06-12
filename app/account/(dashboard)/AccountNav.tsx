'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, LogOut } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const TABS = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard },
  { href: '/account/orders', label: 'My Orders', icon: ShoppingBag },
]

export default function AccountNav() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) =>
    href === '/account' ? pathname === '/account' : pathname.startsWith(href)

  const logout = async () => {
    await createSupabaseBrowserClient().auth.signOut()
    router.replace('/')
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4 mb-8">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
            isActive(t.href) ? 'bg-accent text-white' : 'hover:bg-surface text-text-muted'
          }`}
        >
          <t.icon className="h-4 w-4" />
          {t.label}
        </Link>
      ))}
      <button
        onClick={logout}
        className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-text-muted hover:bg-surface transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  )
}
