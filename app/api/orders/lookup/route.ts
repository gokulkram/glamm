import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

/**
 * Guest-safe order lookup for on-site tracking (item 13).
 * Requires BOTH the order number AND the email on the order, so a
 * stranger can't enumerate other people's orders.
 */
export async function POST(req: NextRequest) {
  let body: { orderNumber?: string; email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const orderNumber = body.orderNumber?.trim()
  const email = body.email?.trim().toLowerCase()

  if (!orderNumber || !email) {
    return NextResponse.json(
      { error: 'Please provide both your order number and email.' },
      { status: 400 },
    )
  }

  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('orders')
    .select(
      'order_number, status, payment_status, tracking_number, tracking_carrier, total, currency, created_at, email, order_items(title, size, quantity, unit_price)',
    )
    .eq('order_number', orderNumber)
    .ilike('email', email)
    .maybeSingle()

  if (error) {
    console.error('Order lookup failed:', error)
    return NextResponse.json({ error: 'Could not look up order' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json(
      { error: 'No order found with that number and email.' },
      { status: 404 },
    )
  }

  // Don't echo the email back to the client
  const { email: _omit, ...order } = data
  return NextResponse.json({ success: true, order })
}
