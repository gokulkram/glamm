'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

/**
 * Renders the store Header/Footer on storefront pages, but NOT on /admin
 * pages, which have their own layout, or /invoice pages, which are a bare
 * printable document.
 */
export default function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isBare = pathname?.startsWith('/admin') || pathname?.startsWith('/invoice')

  if (isBare) return <>{children}</>

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
