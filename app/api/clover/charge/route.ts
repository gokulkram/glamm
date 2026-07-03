import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { priceCart, type CartLineInput } from '@/lib/checkout/pricing'
import { cloverCharge, cloverConfigured } from '@/lib/clover'
import { createOrder } from '@/lib/orders'

export const runtime = 'nodejs'

type ChargeBody = {
  source?: string
  items?: CartLineInput[]
  customer?: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zip?: string
  }
}

/**
 * Card checkout via Clover: recompute the amount from DB prices, charge the
 * Clover.js source token, and only persist the order on approval.
 */
export async function POST(req: NextRequest) {
  let body: ChargeBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const customer = body.customer ?? {}
  const required: (keyof typeof customer)[] = ['email', 'firstName', 'lastName', 'address1', 'city', 'state', 'zip']
  if (required.some((f) => !customer[f]?.trim())) {
    return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 })
  }
  if (!body.source) {
    return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
  }
  if (!cloverConfigured()) {
    return NextResponse.json({ error: 'Card payments are not available right now' }, { status: 503 })
  }

  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Server-authoritative pricing — never trust a client-sent amount.
  const priced = await priceCart(body.items ?? [])
  if ('error' in priced) {
    return NextResponse.json({ error: priced.error }, { status: 400 })
  }
  const { cart } = priced
  const amount = cart.total.toFixed(2)

  const charge = await cloverCharge({
    source: body.source,
    amount,
    clientIp: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
  })

  if (!charge.ok) {
    return NextResponse.json({ error: charge.error, code: charge.code }, { status: 402 })
  }

  const result = await createOrder({
    userId: user?.id ?? null,
    customer: {
      email: customer.email!,
      phone: customer.phone,
      firstName: customer.firstName,
      lastName: customer.lastName,
      address1: customer.address1,
      address2: customer.address2,
      city: customer.city,
      state: customer.state,
      zip: customer.zip,
    },
    items: cart.lineItems.map((l) => ({
      product_id: l.product_id,
      title: l.title,
      slug: l.slug,
      size: l.size,
      image: l.image,
      quantity: l.quantity,
      unit_price: l.unit_price,
    })),
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    total: cart.total,
    payment: {
      method: 'clover',
      status: 'paid',
      transactionId: charge.chargeId,
    },
  })

  if (!result.ok) {
    console.error('PAYMENT CAPTURED BUT ORDER SAVE FAILED', {
      transactionId: charge.chargeId,
      amount,
      email: customer.email,
      error: result.error,
    })
    return NextResponse.json(
      { error: 'Your payment went through but we hit a snag saving the order. Please contact support with your email.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, orderNumber: result.orderNumber })
}
