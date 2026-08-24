import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendShippingNotification, sendOrderStatusUpdate } from '@/lib/email'

export const runtime = 'nodejs'

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed']
const MAX_PACKAGE_DETAILS = 2000
const MAX_SHIPPING_FILES = 10

/** Storage paths come back from our own upload route but arrive via the
 * client, so only accept ones inside this order's folder. */
function ownPaths(raw: unknown, orderId: string): string[] {
  return (Array.isArray(raw) ? raw : [])
    .filter((p): p is string => typeof p === 'string')
    .map((p) => p.trim())
    .filter((p) => p.startsWith(`${orderId}/`) && !p.includes('..'))
}

// Update an order's status / payment / tracking / package details
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    status?: string
    payment_status?: string
    tracking_number?: string
    tracking_carrier?: string
    tracking_url?: string
    package_details?: string
    shipping_files?: unknown
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
  const trackingUrl = body.tracking_url?.trim()
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) {
    return NextResponse.json({ error: 'Tracking URL must start with http:// or https://' }, { status: 400 })
  }
  if (body.package_details && body.package_details.trim().length > MAX_PACKAGE_DETAILS) {
    return NextResponse.json(
      { error: `Please keep package details under ${MAX_PACKAGE_DETAILS} characters.` },
      { status: 400 },
    )
  }

  const sb = supabaseAdmin()

  // Get the current order so we can detect a status transition
  const { data: before } = await sb
    .from('orders')
    .select('status, email, first_name, order_number, tracking_number, tracking_carrier, tracking_url')
    .eq('id', params.id)
    .maybeSingle()
  if (!before) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const update: Record<string, string | string[]> = {}
  if (body.status) update.status = body.status
  if (body.payment_status) update.payment_status = body.payment_status
  if (body.tracking_number !== undefined) update.tracking_number = body.tracking_number.trim()
  if (body.tracking_carrier !== undefined) update.tracking_carrier = body.tracking_carrier.trim()
  if (body.tracking_url !== undefined) update.tracking_url = trackingUrl ?? ''
  if (body.package_details !== undefined) update.package_details = body.package_details.trim()
  if (body.shipping_files !== undefined) {
    const shippingFiles = ownPaths(body.shipping_files, params.id)
    if (shippingFiles.length > MAX_SHIPPING_FILES) {
      return NextResponse.json(
        { error: `Please attach no more than ${MAX_SHIPPING_FILES} files.` },
        { status: 400 },
      )
    }
    update.shipping_files = shippingFiles
  }

  const { data, error } = await sb
    .from('orders')
    .update(update)
    .eq('id', params.id)
    .select('id, status, payment_status, tracking_number, tracking_carrier, tracking_url, package_details, shipping_files')
    .single()

  if (error) {
    console.error('Update order failed:', error)
    return NextResponse.json({ error: 'Could not update order' }, { status: 500 })
  }

  // Notify the customer when the status actually changes to shipped, or when
  // a tracking number is added to an order that's already shipped (e.g. it
  // was left blank when the status was first set). Comparing against `before`
  // means this can only fire once per tracking number — once it's set,
  // `before.tracking_number` is never empty again on a later save.
  const finalTrackingNumber = body.tracking_number !== undefined ? update.tracking_number : before.tracking_number
  const trackingJustSet = Boolean(finalTrackingNumber) && !before.tracking_number
  const statusChanged = Boolean(body.status) && body.status !== before.status
  const statusJustBecameShipped = statusChanged && body.status === 'shipped'
  const trackingAddedWhileAlreadyShipped = !statusChanged && before.status === 'shipped' && trackingJustSet

  let customerEmailed = false
  if (statusJustBecameShipped || trackingAddedWhileAlreadyShipped) {
    customerEmailed = await sendShippingNotification({
      orderNumber: before.order_number,
      email: before.email,
      firstName: before.first_name,
      trackingNumber: data.tracking_number,
      trackingCarrier: data.tracking_carrier,
      trackingUrl: data.tracking_url,
    })
  } else if (statusChanged) {
    customerEmailed = await sendOrderStatusUpdate({
      orderNumber: before.order_number,
      email: before.email,
      firstName: before.first_name,
      status: body.status!,
    })
  }

  return NextResponse.json({ success: true, order: data, shippingEmailed: customerEmailed, customerEmailed })
}
