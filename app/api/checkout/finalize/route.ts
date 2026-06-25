import { NextRequest, NextResponse } from 'next/server'
import { getStripe, stripeConfigured } from '@/lib/stripe'
import { createOrderFromPaymentIntent } from '@/lib/checkout/stripeOrder'

export const runtime = 'nodejs'

// Turn a succeeded PaymentIntent into an order. Called from the return page;
// the webhook does the same so the order lands even if the tab is closed.
// Idempotent on the PaymentIntent id.
export async function POST(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: 'Card payments are not available right now' }, { status: 503 })
  }

  let body: { paymentIntentId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!body.paymentIntentId) {
    return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 })
  }

  const stripe = getStripe()!
  const pi = await stripe.paymentIntents.retrieve(body.paymentIntentId)

  if (pi.status !== 'succeeded') {
    return NextResponse.json({ success: false, status: pi.status }, { status: 200 })
  }

  const result = await createOrderFromPaymentIntent(pi)
  if (!result.ok) {
    console.error('Order save after Stripe payment failed', { paymentIntent: pi.id, error: result.error })
    return NextResponse.json(
      { error: 'Your payment went through but we hit a snag saving the order. Please contact support.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, orderNumber: result.orderNumber })
}
