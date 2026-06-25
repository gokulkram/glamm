import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createOrderFromPaymentIntent } from '@/lib/checkout/stripeOrder'

export const runtime = 'nodejs'

// Stripe webhook — the authoritative order finaliser. Verifies the signature,
// then creates the order on payment_intent.succeeded (idempotent on the PI id).
export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  const raw = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const res = await createOrderFromPaymentIntent(pi)
    if (!res.ok) console.error('Webhook order create failed', pi.id, res.error)
  }

  return NextResponse.json({ received: true })
}
