'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { ShoppingBag, ArrowRight, CreditCard, Lock, Loader2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, getCartTotal, clearCart } = useCart()
  const [clientToken, setClientToken] = useState<string | null>(null)
  const [epi, setEpi] = useState<string>('')
  const [isDemo, setIsDemo] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Customer info state
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
  })

  const cartTotal = getCartTotal()

  useEffect(() => {
    if (cart.length === 0) {
      setIsLoading(false)
      return
    }

    // Fetch client token from our API
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/valor/get-client-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: cartTotal.toFixed(2) }),
        })
        const data = await response.json()

        if (data.success) {
          setClientToken(data.clientToken)
          setEpi(data.epi)
          setIsDemo(data.isDemo)
        } else {
          setError('Unable to initialize payment. Please try again.')
        }
      } catch (err) {
        setError('Payment system unavailable. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchToken()
  }, [cart.length, cartTotal])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value })
  }

  // If cart is empty, show empty state
  if (cart.length === 0) {
    return (
      <div className="section">
        <div className="container-max max-w-2xl text-center py-20">
          <ShoppingBag className="w-24 h-24 text-text-muted mx-auto mb-6 opacity-50" />
          <h1 className="text-4xl font-bold text-text mb-4">Your Cart is Empty</h1>
          <p className="text-text-muted mb-8">
            Add some items to your cart before checking out.
          </p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-full hover:bg-accent-dark transition-colors">
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="section">
        <div className="container-max max-w-2xl text-center py-20">
          <Loader2 className="w-12 h-12 text-accent mx-auto mb-4 animate-spin" />
          <p className="text-text-muted">Initializing secure checkout...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="section">
        <div className="container-max max-w-2xl text-center py-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-accent text-white rounded-full hover:bg-accent-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="section bg-background">
      <div className="container-max">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Secure Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Customer Info & Payment */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="grid gap-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="firstName" placeholder="First Name" value={customerInfo.firstName} onChange={handleInputChange} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent" required />
                  <input type="text" name="lastName" placeholder="Last Name" value={customerInfo.lastName} onChange={handleInputChange} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent" required />
                </div>
                <input type="text" name="address1" placeholder="Address" value={customerInfo.address1} onChange={handleInputChange} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent" required />
                <input type="text" name="address2" placeholder="Apartment, suite, etc. (optional)" value={customerInfo.address2} onChange={handleInputChange} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent" />
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" name="city" placeholder="City" value={customerInfo.city} onChange={handleInputChange} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent" required />
                  <input type="text" name="state" placeholder="State" value={customerInfo.state} onChange={handleInputChange} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent" required />
                  <input type="text" name="zip" placeholder="ZIP" value={customerInfo.zip} onChange={handleInputChange} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent" required />
                </div>
              </div>
            </div>

            {/* Payment - Valor Passage.js */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">Payment</h2>
              </div>

              {/* Valor Passage.js container */}
              <div id="valor-fields" className="mb-4"></div>

              {isDemo && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm">
                  <strong>Test Mode:</strong> Use card 4111111111111111, Address: 8320, ZIP: 85284
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                <span>Your payment info is secure and encrypted</span>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${item.size}-${index}`} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.size} • Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${(item.selectedPrice * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valor Passage.js Script */}
      {clientToken && (
        <Script
          src="https://js.valorpaytech.com/V1/js/Passage.min.js"
          data-name="valor_passage"
          data-clientToken={clientToken}
          data-epi={epi}
          data-demo={isDemo ? 'true' : undefined}
          data-billingAddress="false"
          data-email="false"
          data-phone="false"
          data-cardholderName="true"
          data-submitText={`Pay $${cartTotal.toFixed(2)}`}
          data-submitBg="#B76E79"
          data-submitColor="#ffffff"
          strategy="lazyOnload"
        />
      )}
    </div>
  )
}

