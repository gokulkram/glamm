import { NextRequest, NextResponse } from 'next/server'
import { priceCart, type CartLineInput } from '@/lib/checkout/pricing'
import { validateCoupon } from '@/lib/coupons'

export const runtime = 'nodejs'

// Preview a coupon against a cart without a PaymentIntent (used on the manual /
// no-card checkout path). The actual discount is re-validated server-side again
// when the order is placed, so this is purely for display.
export async function POST(req: NextRequest) {
  let body: { items?: CartLineInput[]; code?: string; email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request' }, { status: 400 })
  }

  const priced = await priceCart(body.items ?? [])
  if ('error' in priced) {
    return NextResponse.json({ ok: false, message: priced.error }, { status: 400 })
  }
  const { subtotal, shipping } = priced.cart

  const result = await validateCoupon(body.code ?? '', subtotal, body.email)
  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      message: result.message,
      subtotal,
      shipping,
      discount: 0,
      total: Number((subtotal + shipping).toFixed(2)),
    })
  }

  return NextResponse.json({
    ok: true,
    code: result.coupon.code,
    message: `Code ${result.coupon.code} applied`,
    subtotal,
    shipping,
    discount: result.discount,
    total: Number((subtotal - result.discount + shipping).toFixed(2)),
  })
}
