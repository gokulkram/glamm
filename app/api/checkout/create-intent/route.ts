import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { priceCart, type CartLineInput } from '@/lib/checkout/pricing'
import { getStripe, stripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'

// Create a Stripe PaymentIntent for the cart. Amount is computed server-side
// from DB prices; the cart travels in metadata so the order can be built on
// success (return page or webhook).
export async function POST(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: 'Card payments are not available right now' }, { status: 503 })
  }

  let body: { items?: CartLineInput[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const priced = await priceCart(body.items ?? [])
  if ('error' in priced) {
    return NextResponse.json({ error: priced.error }, { status: 400 })
  }
  const { cart } = priced

  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Compact cart for metadata (≤500 chars/value). Guard against huge carts.
  const cartMeta = JSON.stringify(cart.lineItems.map((l) => ({ p: l.product_id, s: l.size, q: l.quantity })))
  if (cartMeta.length > 480) {
    return NextResponse.json({ error: 'Too many items to check out at once' }, { status: 400 })
  }

  const stripe = getStripe()!
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(cart.total * 100),
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { cart: cartMeta, userId: user?.id ?? '' },
  })

  return NextResponse.json({
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amount: cart.total,
  })
}
