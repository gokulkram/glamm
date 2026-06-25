import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createOrder, type OrderItem } from '@/lib/orders'
import { computeShipping } from '@/lib/checkout/shipping'
import { getShippingConfig } from '@/lib/settings'

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
  const total = subtotal + shippingCost

  const result = await createOrder({
    userId: user?.id ?? null,
    customer,
    items,
    subtotal,
    shipping: shippingCost,
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
    total,
  })
}
