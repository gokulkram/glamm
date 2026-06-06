import './globals.css'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CartProvider } from '@/contexts/CartContext'
import { WishlistProvider } from '@/contexts/WishlistContext'

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
        <CartProvider>
          <WishlistProvider>
            <Header />
            <main>
              {children}
            </main>
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}

