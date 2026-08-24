'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Settings,
  Ticket,
  Home,
  Newspaper,
  Star,
  Quote,
  HelpCircle,
  Mail,
  CreditCard,
} from 'lucide-react'
import { isActivePath } from './AdminSidebar'

// Every page the desktop sidebar links to (see AdminSidebar's NAV) — the
// sidebar is hidden on mobile, so this is the only way to reach them there.
const MOBILE_NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/payment', label: 'Payment', icon: CreditCard },
  { href: '/admin/discounts', label: 'Discounts', icon: Ticket },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/homepage', label: 'Homepage', icon: Home },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Quote },
  { href: '/admin/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/admin/contact', label: 'Contact', icon: Mail },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminMobileNav() {
  const pathname = usePathname()

  return (
    <div
      className="md:hidden flex items-center gap-1 overflow-x-auto px-3 py-2 text-white"
      style={{ background: 'linear-gradient(135deg, #0a1121, #1a2744)' }}
    >
      {MOBILE_NAV.map((item) => {
        const active = isActivePath(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-sm transition-colors ${
              active ? 'bg-accent text-white font-medium' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
