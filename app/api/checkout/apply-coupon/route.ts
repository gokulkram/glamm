import { NextRequest, NextResponse } from 'next/server'
import { getStripe, stripeConfigured } from '@/lib/stripe'
import { priceCart, type CartLineInput } from '@/lib/checkout/pricing'
import { validateCoupon } from '@/lib/coupons'

export const runtime = 'nodejs'

// Apply (or remove, when `code` is blank) a discount code to an existing
// PaymentIntent. The cart is read from the PI metadata (authoritative, set at
// create-intent) — never re-accepted from the client. The validated discount is
// stored in metadata so the order is finalised with exactly what was charged.
export async function POST(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json({ ok: false, message: 'Card payments are not available right now' }, { status: 503 })
  }

  let body: { paymentIntentId?: string; code?: string; email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request' }, { status: 400 })
  }
  if (!body.paymentIntentId) {
    return NextResponse.json({ ok: false, message: 'Missing payment reference' }, { status: 400 })
  }

  const stripe = getStripe()!
  const pi = await stripe.paymentIntents.retrieve(body.paymentIntentId)
  const updatable = ['requires_payment_method', 'requires_confirmation', 'requires_action']
  if (!updatable.includes(pi.status)) {
    return NextResponse.json({ ok: false, message: 'This payment can no longer be changed' }, { status: 409 })
  }

  // Re-price the authoritative cart from the PI metadata.
  const m = (pi.metadata ?? {}) as Record<string, string>
  let items: CartLineInput[]
  try {
    items = (JSON.parse(m.cart || '[]') as { p: number; s: string; q: number }[]).map((x) => ({
      product_id: Number(x.p),
      size: x.s,
      quantity: Number(x.q),
    }))
  } catch {
    return NextResponse.json({ ok: false, message: 'Could not read your cart' }, { status: 400 })
  }
  const priced = await priceCart(items)
  if ('error' in priced) {
    return NextResponse.json({ ok: false, message: priced.error }, { status: 400 })
  }
  const { subtotal, shipping } = priced.cart

  const setAmount = async (discount: number, code: string) => {
    const total = Number((subtotal - discount + shipping).toFixed(2))
    await stripe.paymentIntents.update(pi.id, {
      amount: Math.round(total * 100),
      metadata: { ...m, code, discount: discount.toFixed(2) },
    })
    return { subtotal, shipping, discount, total }
  }

  const code = (body.code || '').trim().toUpperCase()

  // Blank code = remove any applied discount.
  if (!code) {
    const amounts = await setAmount(0, '')
    return NextResponse.json({ ok: true, removed: true, ...amounts })
  }

  const result = await validateCoupon(code, subtotal, body.email)
  if (!result.ok) {
    // Invalid — make sure the PI is back to the undiscounted amount.
    const amounts = await setAmount(0, '')
    return NextResponse.json({ ok: false, message: result.message, ...amounts })
  }

  const amounts = await setAmount(result.discount, code)
  return NextResponse.json({ ok: true, code, message: `Code ${code} applied`, ...amounts })
}
