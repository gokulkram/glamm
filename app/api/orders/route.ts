import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createOrder, type OrderItem } from '@/lib/orders'
import { computeShipping } from '@/lib/checkout/shipping'
import { getShippingConfig } from '@/lib/settings'
import { validateCoupon } from '@/lib/coupons'

export const runtime = 'nodejs'

type IncomingOrder = {
  customer: {
    email: string
    phone?: string
    firstName?: string
    lastName?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  items: OrderItem[]
  shipping?: number
  couponCode?: string
  payment?: {
    method?: string
    status?: 'pending' | 'paid' | 'failed'
    transactionId?: string
    authCode?: string
  }
}

// Manual order placement (no card charge — "pay on delivery / contact me").
// The secured card path lives in /api/checkout/pay.
export async function POST(req: NextRequest) {
  let body: IncomingOrder
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { customer, items, payment } = body || ({} as IncomingOrder)

  // Derive the buyer from the session (never trust a client-sent user id).
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!customer?.email) {
    return NextResponse.json({ error: 'Customer email is required' }, { status: 400 })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 })
  }

  const subtotal = items.reduce((sum, it) => sum + Number(it.unit_price) * Number(it.quantity), 0)
  const shippingCost = computeShipping(subtotal, await getShippingConfig())

  // Validate the coupon server-side (never trust a client-sent discount amount).
  let discount = 0
  let couponCode: string | null = null
  if (body.couponCode) {
    const result = await validateCoupon(body.couponCode, subtotal, customer.email)
    if (result.ok) {
      discount = result.discount
      couponCode = result.coupon.code
    }
    // Invalid codes are silently ignored on manual orders (order still places).
  }

  const total = Number((subtotal - discount + shippingCost).toFixed(2))

  const result = await createOrder({
    userId: user?.id ?? null,
    customer,
    items,
    subtotal,
    shipping: shippingCost,
    discount,
    couponCode,
    total,
    payment: payment ?? { method: 'manual', status: 'pending' },
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    orderNumber: result.orderNumber,
    orderId: result.orderId,
    subtotal,
    discount,
    total,
  })
}
