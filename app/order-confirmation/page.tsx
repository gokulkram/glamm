import Link from 'next/link'
import { CheckCircle, Package, Mail, Home } from 'lucide-react'
import { getStripe } from '@/lib/stripe'
import { createOrderFromPaymentIntent } from '@/lib/checkout/stripeOrder'

export const dynamic = 'force-dynamic'

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { order?: string; payment_intent?: string }
}) {
  let orderNumber: string | null = searchParams.order ?? null

  // 3-D Secure return: finalise the order from the PaymentIntent (idempotent).
  if (!orderNumber && searchParams.payment_intent) {
    const stripe = getStripe()
    if (stripe) {
      try {
        const pi = await stripe.paymentIntents.retrieve(searchParams.payment_intent)
        if (pi.status === 'succeeded') {
          const res = await createOrderFromPaymentIntent(pi)
          if (res.ok) orderNumber = res.orderNumber
        }
      } catch {
        /* fall through — show a generic confirmation */
      }
    }
  }

  return (
    <div className="section">
      <div className="container-max max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-xl text-text-muted mb-2">
            Thank you for your purchase
          </p>
          {orderNumber && (
            <p className="text-text-muted">
              Order #{orderNumber}
            </p>
          )}
        </div>

        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">What's Next?</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Order Confirmation Email</h3>
                <p className="text-sm text-text-muted">
                  We've sent a confirmation email with your order details to your email address.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Processing Your Order</h3>
                <p className="text-sm text-text-muted">
                  Your order is being prepared and will be shipped within 1-2 business days.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Home className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Delivery</h3>
                <p className="text-sm text-text-muted">
                  You'll receive a tracking number once your order ships. Estimated delivery: 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop" className="btn btn-primary">
            Continue Shopping
          </Link>
          <Link href="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>

        {/* Trust Message */}
        <div className="mt-12 p-6 rounded-2xl bg-surface text-center">
          <p className="text-text-muted mb-4">
            Need help with your order?
          </p>
          <Link href="/contact" className="text-accent font-semibold hover:underline">
            Contact our support team
          </Link>
        </div>
      </div>
    </div>
  )
}

