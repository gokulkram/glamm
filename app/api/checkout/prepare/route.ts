import { NextRequest, NextResponse } from 'next/server'
import { getStripe, stripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'

// Attach the shipping/contact details to the PaymentIntent metadata just before
// the charge, so the order can be built on success even after a 3-D Secure
// redirect (when the React state is gone).
export async function POST(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: 'Card payments are not available right now' }, { status: 503 })
  }

  let body: {
    paymentIntentId?: string
    customer?: Record<string, string>
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const c = body.customer ?? {}
  const required = ['email', 'firstName', 'lastName', 'address1', 'city', 'state', 'zip']
  if (!body.paymentIntentId || required.some((f) => !c[f]?.trim())) {
    return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 })
  }

  const stripe = getStripe()!
  await stripe.paymentIntents.update(body.paymentIntentId, {
    receipt_email: c.email,
    // Merges with the existing metadata (cart, userId).
    metadata: {
      email: c.email ?? '',
      phone: c.phone ?? '',
      firstName: c.firstName ?? '',
      lastName: c.lastName ?? '',
      address1: c.address1 ?? '',
      address2: c.address2 ?? '',
      city: c.city ?? '',
      state: c.state ?? '',
      zip: c.zip ?? '',
    },
  })

  return NextResponse.json({ ok: true })
}
