import './globals.css'
import type { Metadata } from 'next'
import ConditionalChrome from '@/components/layout/ConditionalChrome'
import { CartProvider } from '@/contexts/CartContext'
import { WishlistProvider } from '@/contexts/WishlistContext'
import { ShippingProvider } from '@/contexts/ShippingContext'

export const metadata: Metadata = {
  title: 'Glamm Hair Extensions | Premium 100% Virgin Human Hair',
  description: 'Premium 100% virgin human hair extensions. Wavy, straight, curly styles & HD closures. Free shipping & 30-day returns.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <ShippingProvider>
          <CartProvider>
            <WishlistProvider>
              <ConditionalChrome>{children}</ConditionalChrome>
            </WishlistProvider>
          </CartProvider>
        </ShippingProvider>
      </body>
    </html>
  )
}

