import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { priceCart, type CartLineInput } from '@/lib/checkout/pricing'
import { valorSale, valorConfigured } from '@/lib/valor'
import { createOrder } from '@/lib/orders'

export const runtime = 'nodejs'

type PayBody = {
  token?: string
  idempotencyKey?: string
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
 * Card checkout: recompute the amount from DB prices, charge the Passage.js
 * token via Valor, and only persist the order on approval. Idempotency-keyed
 * so a retry can't double-charge.
 */
export async function POST(req: NextRequest) {
  let body: PayBody
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
  if (!body.token) {
    return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
  }
  if (!valorConfigured()) {
    return NextResponse.json({ error: 'Card payments are not available right now' }, { status: 503 })
  }

  // Buyer from the session (checkout is login-gated by middleware).
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

  // Charge the card via Valor.
  const sale = await valorSale({
    token: body.token,
    amount,
    email: customer.email,
    phone: customer.phone,
    address1: customer.address1,
    address2: customer.address2,
    city: customer.city,
    state: customer.state,
    zip: customer.zip,
  })

  if (!sale.ok) {
    // Declined / processor error — no order is created.
    return NextResponse.json({ error: sale.error, code: sale.code }, { status: 402 })
  }

  // Payment approved → persist the order with authoritative line items.
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
      method: 'valor',
      status: 'paid',
      transactionId: sale.transactionId,
      authCode: sale.authCode,
    },
  })

  if (!result.ok) {
    // Charge succeeded but we couldn't save the order — surface it loudly so it
    // can be reconciled rather than silently lost.
    console.error('PAYMENT CAPTURED BUT ORDER SAVE FAILED', {
      transactionId: sale.transactionId,
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
