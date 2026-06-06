'use client'

import { useState } from 'react'
import { Package, Truck, Search, Mail, Clock } from 'lucide-react'

const carriers = [
  { id: 'auto', label: 'Auto Detect', url: (n: string) => `https://t.17track.net/en#nums=${encodeURIComponent(n)}` },
  { id: 'ups', label: 'UPS', url: (n: string) => `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}` },
  { id: 'usps', label: 'USPS', url: (n: string) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(n)}` },
  { id: 'fedex', label: 'FedEx', url: (n: string) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}` },
  { id: 'dhl', label: 'DHL', url: (n: string) => `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${encodeURIComponent(n)}` },
]

export default function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('auto')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = trackingNumber.trim()
    if (!trimmed) {
      setError('Please enter your tracking number.')
      return
    }
    setError('')
    const selected = carriers.find((c) => c.id === carrier) ?? carriers[0]
    window.open(selected.url(trimmed), '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[320px] flex items-center overflow-hidden bg-gradient-to-br from-accent/10 via-background to-accent/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="container-max relative py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Truck className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Order Tracking</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">Track Your Package</h1>
            <p className="text-lg text-text-muted">
              Enter your tracking number below for the latest updates on your delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Tracking Form */}
      <section className="section container-max">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 md:p-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-6">
              <Package className="w-7 h-7 text-accent" />
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="carrier" className="block text-sm font-semibold mb-2">Carrier</label>
                <select
                  id="carrier"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-sm outline-none focus:border-accent transition-colors"
                >
                  {carriers.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="tracking" className="block text-sm font-semibold mb-2">Tracking Number</label>
                <input
                  id="tracking"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter your tracking number"
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-sm outline-none focus:border-accent transition-colors"
                />
                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
              </div>
              <button type="submit" className="btn btn-primary w-full">
                <Search className="w-4 h-4" />
                Track Package
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Order Shipped but Not Received */}
      <section className="section container-max pt-0">
        <div className="max-w-4xl mx-auto policy-content space-y-6 text-text-muted leading-relaxed">
          <h2>Order Shipped but Not Received? What to Do</h2>
          <p>
            We strive to ensure that your packages are delivered to you as safely as possible, but the shipping
            process is not 100% controllable. Don&apos;t worry, we offer solutions to address this issue.
          </p>

          <h3>Important: Before Contacting Your Bank</h3>
          <p>
            Your satisfaction is our top priority, and we are 100% committed to resolving any issues for you. Before
            considering a chargeback, please reach out to us directly. This is the fastest and most effective way to
            get a full refund or a replacement sent out. Please trust us to make things right for you.
          </p>

          <h3>Check Status &amp; Track Your Package</h3>
          <ul>
            <li>
              <strong>When will it ship?</strong> Your order will be processed and shipped within 0 to 3 business
              days. Once shipped, you will receive a confirmation email with your tracking number. Please be sure to
              check your spam folder.
            </li>
            <li>
              <strong>A note on delays:</strong> Please be aware that U.S. tariff policies can occasionally impact our
              supply chain, which may extend the processing time for some orders. We work hard to minimize these
              delays and appreciate your patience.
            </li>
            <li>
              <strong>When to contact us:</strong> If you have not received your shipping confirmation email, please
              get in touch with us if it has been more than 5 business days.
            </li>
          </ul>

          <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 not-prose">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-accent" />
              <span className="text-sm">Still need help with a delivery?</span>
            </div>
            <a href="mailto:support@glammhairextensions.com" className="btn btn-primary sm:ml-auto">
              <Mail className="w-4 h-4" />
              Email Support
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
