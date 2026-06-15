import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendShippingNotification } from '@/lib/email'

export const runtime = 'nodejs'

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed']

// Update an order's status / payment / tracking
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    status?: string
    payment_status?: string
    tracking_number?: string
    tracking_carrier?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (body.status && !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  if (body.payment_status && !PAYMENT_STATUSES.includes(body.payment_status)) {
    return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
  }

  const sb = supabaseAdmin()

  // Get the current order so we can detect a transition into "shipped"
  const { data: before } = await sb
    .from('orders')
    .select('status, email, first_name, tracking_number, tracking_carrier')
    .eq('id', params.id)
    .maybeSingle()
  if (!before) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const update: Record<string, string> = {}
  if (body.status) update.status = body.status
  if (body.payment_status) update.payment_status = body.payment_status
  if (body.tracking_number !== undefined) update.tracking_number = body.tracking_number.trim()
  if (body.tracking_carrier !== undefined) update.tracking_carrier = body.tracking_carrier.trim()

  const { data, error } = await sb
    .from('orders')
    .update(update)
    .eq('id', params.id)
    .select('id, status, payment_status, tracking_number, tracking_carrier')
    .single()

  if (error) {
    console.error('Update order failed:', error)
    return NextResponse.json({ error: 'Could not update order' }, { status: 500 })
  }

  // Send a shipping email when the order first becomes "shipped"
  let shippingEmailed = false
  if (body.status === 'shipped' && before.status !== 'shipped') {
    shippingEmailed = await sendShippingNotification({
      orderNumber: (await sb.from('orders').select('order_number').eq('id', params.id).single()).data!
        .order_number,
      email: before.email,
      firstName: before.first_name,
      trackingNumber: data.tracking_number,
      trackingCarrier: data.tracking_carrier,
    })
  }

  return NextResponse.json({ success: true, order: data, shippingEmailed })
}
