'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, Truck, Search, Mail, Clock, Check, Home, Loader2 } from 'lucide-react'

type LookupItem = { title: string; size: string | null; quantity: number; unit_price: number }
type LookupOrder = {
  order_number: string
  status: string
  payment_status: string
  tracking_number: string | null
  tracking_carrier: string | null
  total: number
  currency: string
  created_at: string
  order_items: LookupItem[]
}

const STEPS = [
  { key: 'paid', label: 'Confirmed', icon: Check },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
]
const stepIndex = (s: string) =>
  s === 'delivered' ? 3 : s === 'shipped' ? 2 : s === 'processing' ? 1 : s === 'paid' ? 0 : -1

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<LookupOrder | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOrder(null)
    if (!orderNumber.trim() || !email.trim()) {
      setError('Please enter both your order number and email.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/orders/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Could not find that order.')
      return
    }
    setOrder(data.order)
  }

  const step = order ? stepIndex(order.status) : -1
  const cancelled = order?.status === 'cancelled' || order?.status === 'refunded'

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[280px] flex items-center overflow-hidden bg-gradient-to-br from-accent/10 via-background to-accent/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="container-max relative py-14">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Truck className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Order Tracking</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">Track Your Order</h1>
            <p className="text-lg text-text-muted">Enter your order number and email to see the latest status.</p>
          </div>
        </div>
      </section>

      {/* Lookup form */}
      <section className="section container-max">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 md:p-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-6">
              <Package className="w-7 h-7 text-accent" />
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-semibold mb-2">Order Number</label>
                <input
                  id="orderNumber"
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. GLM-XXXXXXXX"
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-sm outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="The email used on your order"
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white text-sm outline-none focus:border-accent transition-colors"
                />
                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Track Order</>}
              </button>
            </form>

            <p className="text-xs text-text-muted text-center mt-4">
              Have an account?{' '}
              <Link href="/account/orders" className="text-accent font-medium hover:underline">View all your orders</Link>
            </p>
          </div>

          {/* Result */}
          {order && (
            <div className="card p-8 mt-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-lg">{order.order_number}</h2>
                <span className="text-sm text-text-muted">${order.total.toFixed(2)}</span>
              </div>
              <p className="text-sm text-text-muted mb-6 capitalize">Status: {order.status}</p>

              {cancelled ? (
                <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700 capitalize">
                  <Clock className="h-4 w-4" /> {order.status}
                </div>
              ) : (
                <div className="flex items-center mb-6">
                  {STEPS.map((s, i) => {
                    const done = i <= step
                    const Icon = s.icon
                    return (
                      <div key={s.key} className="flex-1 flex flex-col items-center relative">
                        {i > 0 && <div className={`absolute right-1/2 top-5 h-0.5 w-full ${i <= step ? 'bg-accent' : 'bg-border'}`} />}
                        <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${done ? 'bg-accent text-white' : 'bg-surface text-text-muted border border-border'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`mt-2 text-xs text-center ${done ? 'font-medium' : 'text-text-muted'}`}>{s.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {order.status === 'pending' && (
                <p className="text-sm text-text-muted">We&apos;ve received your order and will confirm it shortly.</p>
              )}
              {order.tracking_number && (
                <div className="rounded-lg bg-surface p-4 text-sm">
                  <span className="text-text-muted">Tracking number: </span>
                  <span className="font-medium">{order.tracking_number}</span>
                  {order.tracking_carrier && <span className="text-text-muted"> ({order.tracking_carrier})</span>}
                </div>
              )}

              <div className="mt-6 border-t border-border pt-4 space-y-2">
                {order.order_items.map((it, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{it.title}{it.size ? ` · ${it.size}` : ''} × {it.quantity}</span>
                    <span className="text-text-muted">${(it.unit_price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            get a full refund or a replacement sent out.
          </p>
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
