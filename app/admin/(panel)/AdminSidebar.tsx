'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Package,
  Tags,
  ShoppingBag,
  Users,
  ExternalLink,
  LogOut,
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
]

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' || pathname.startsWith('/admin/products') : pathname.startsWith(href)

  const logout = async () => {
    await createSupabaseBrowserClient().auth.signOut()
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <aside
      className="hidden md:flex w-60 shrink-0 flex-col text-white"
      style={{ background: 'linear-gradient(180deg, #0a1121, #1a2744)' }}
    >
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/admin" className="font-bold text-lg">
          Glamm <span className="text-accent">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ExternalLink className="h-4.5 w-4.5" />
          View store
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          Log out
        </button>
        <div className="px-3 pt-2 text-xs text-white/40 truncate">{email}</div>
      </div>
    </aside>
  )
}
