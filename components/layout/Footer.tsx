import Link from 'next/link'
import Image from 'next/image'
import { Instagram } from 'lucide-react'
import PaymentMethods from '@/components/PaymentMethods'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border" style={{ background: 'linear-gradient(135deg, #0a1121, #1a2744)' }}>
      {/* Main Footer */}
      <div className="container-max py-12 grid gap-8 md:grid-cols-4">
        {/* Brand */}
        <div>
          <Link href="/" className="inline-block mb-3">
            <Image
              src="/glamm-logo.png"
              alt="Glamm Hair Extensions"
              width={180}
              height={60}
              className="h-14 w-auto brightness-0 invert"
            />
          </Link>
          <p className="text-white/70 max-w-xs text-sm leading-relaxed">
            Premium hair extensions shipped nationwide. Clean design, effortless installation, and natural finish.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="https://www.instagram.com/glammhair_extenions"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-accent transition-all duration-300 group"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-semibold mb-3 text-white">Shop</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/shop?category=wavy" className="hover:text-accent transition-colors">Wavy</Link></li>
            <li><Link href="/shop?category=straight" className="hover:text-accent transition-colors">Straight</Link></li>
            <li><Link href="/shop?category=curly" className="hover:text-accent transition-colors">Curly</Link></li>
            <li><Link href="/shop?category=closures" className="hover:text-accent transition-colors">Closures</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold mb-3 text-white">Company</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/about" className="hover:text-accent transition-colors">About</Link></li>
            <li><Link href="/how-to-use" className="hover:text-accent transition-colors">Care & Tutorials</Link></li>
            <li><Link href="/faq" className="hover:text-accent transition-colors">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 className="font-semibold mb-3 text-white">Connect</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/track-order" className="hover:text-accent transition-colors">Track Order</Link></li>
            <li><Link href="/return-policy" className="hover:text-accent transition-colors">Refund & Exchange</Link></li>
            <li><Link href="/shipping" className="hover:text-accent transition-colors">Shipping Policy</Link></li>
            <li><Link href="/how-to-pay" className="hover:text-accent transition-colors">How To Pay</Link></li>
            <li><Link href="/delivery-issues" className="hover:text-accent transition-colors">Delivery Issues</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms-of-service" className="hover:text-accent transition-colors">Terms of Service</Link></li>
            <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-white/10 py-6">
        <div className="container-max flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-wider text-white/50">We Accept</p>
          <PaymentMethods className="justify-center" />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Glamm Hair Extensions. All rights reserved.
      </div>
    </footer>
  )
}

