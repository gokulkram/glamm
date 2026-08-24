'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Settings,
  Newspaper,
  Star,
  Quote,
  Ticket,
  ExternalLink,
  LogOut,
  Home,
  HelpCircle,
  Mail,
  Boxes,
  BadgeDollarSign,
  Layers,
  ChevronDown,
  CreditCard,
  type LucideIcon,
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type NavItem = { href: string; label: string; icon: LucideIcon }
type NavEntry =
  | ({ type: 'link' } & NavItem)
  | { type: 'group'; label: string; icon: LucideIcon; items: NavItem[] }

const NAV: NavEntry[] = [
  { type: 'link', href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  {
    type: 'group',
    label: 'Catalog',
    icon: Boxes,
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/categories', label: 'Categories', icon: Tags },
    ],
  },
  {
    type: 'group',
    label: 'Sales',
    icon: BadgeDollarSign,
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/admin/payment', label: 'Payment', icon: CreditCard },
      { href: '/admin/discounts', label: 'Discounts', icon: Ticket },
      { href: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    type: 'group',
    label: 'Content',
    icon: Layers,
    items: [
      { href: '/admin/homepage', label: 'Homepage', icon: Home },
      { href: '/admin/blog', label: 'Blog', icon: Newspaper },
      { href: '/admin/reviews', label: 'Reviews', icon: Star },
      { href: '/admin/testimonials', label: 'Testimonials', icon: Quote },
      { href: '/admin/faq', label: 'FAQ', icon: HelpCircle },
      { href: '/admin/contact', label: 'Contact', icon: Mail },
    ],
  },
  { type: 'link', href: '/admin/settings', label: 'Settings', icon: Settings },
]

/** Persists which groups the admin has manually opened/closed across visits. */
const GROUP_STATE_KEY = 'admin-sidebar-open-groups'

/** Shared with AdminMobileNav so both navs agree on what counts as "active". */
export function isActivePath(pathname: string, href: string) {
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
}

function groupHasActiveItem(pathname: string, items: NavItem[]) {
  return items.some((i) => isActivePath(pathname, i.href))
}

/** Whichever groups hold the current page, so it's never hidden on load. */
function activeGroups(pathname: string): Record<string, boolean> {
  const open: Record<string, boolean> = {}
  for (const entry of NAV) {
    if (entry.type === 'group' && groupHasActiveItem(pathname, entry.items)) open[entry.label] = true
  }
  return open
}

export default function AdminSidebar({ email, name }: { email: string; name?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  // Seeded from the route alone (same on server and client) so the active
  // group is already open on first paint — localStorage prefs layer in after
  // mount, once they're actually available.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => activeGroups(pathname))

  useEffect(() => {
    let stored: Record<string, boolean> = {}
    try {
      stored = JSON.parse(localStorage.getItem(GROUP_STATE_KEY) || '{}')
    } catch {
      stored = {}
    }
    setOpenGroups({ ...stored, ...activeGroups(pathname) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [label]: !prev[label] }
      try {
        localStorage.setItem(GROUP_STATE_KEY, JSON.stringify(next))
      } catch {
        // Private browsing, storage disabled, etc. — the toggle still works
        // for this page view, it just won't be remembered next time.
      }
      return next
    })
  }

  const logout = async () => {
    await createSupabaseBrowserClient().auth.signOut()
    router.replace('/admin/login')
    router.refresh()
  }

  const linkCls = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
      active ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`

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

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((entry) => {
          if (entry.type === 'link') {
            return (
              <Link key={entry.href} href={entry.href} className={linkCls(isActivePath(pathname, entry.href))}>
                <entry.icon className="h-4.5 w-4.5" />
                {entry.label}
              </Link>
            )
          }

          const hasActive = groupHasActiveItem(pathname, entry.items)
          const open = openGroups[entry.label] ?? hasActive

          return (
            <div key={entry.label}>
              <button
                type="button"
                onClick={() => toggleGroup(entry.label)}
                aria-expanded={open}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  hasActive && !open ? 'text-white bg-white/10' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <entry.icon className="h-4.5 w-4.5" />
                <span className="flex-1 text-left">{entry.label}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && (
                <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-1">
                  {entry.items.map((item) => (
                    <Link key={item.href} href={item.href} className={linkCls(isActivePath(pathname, item.href))}>
                      <item.icon className="h-4.5 w-4.5" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
        <div className="px-3 pt-2 leading-tight">
          {name && <div className="text-sm font-medium text-white/90 truncate">{name}</div>}
          <div className="text-xs text-white/40 truncate">{email}</div>
        </div>
      </div>
    </aside>
  )
}
