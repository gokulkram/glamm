import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type IncomingItem = {
  product_id?: number
  title: string
  slug?: string
  size?: string
  image?: string
  quantity: number
  unit_price: number
}

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
  items: IncomingItem[]
  shipping?: number
  payment?: {
    method?: string
    status?: 'pending' | 'paid' | 'failed'
    transactionId?: string
    authCode?: string
  }
  userId?: string | null
}

// Human-friendly order number, e.g. GLM-8F3K2A1B
function generateOrderNumber() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars
  const bytes = randomBytes(8)
  let out = ''
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length]
  return `GLM-${out}`
}

export async function POST(req: NextRequest) {
  let body: IncomingOrder
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { customer, items, shipping = 0, payment } = body || ({} as IncomingOrder)

  // Derive the buyer from the session (never trust a client-sent user id).
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  // --- validation ---
  if (!customer?.email) {
    return NextResponse.json({ error: 'Customer email is required' }, { status: 400 })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 })
  }

  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.unit_price) * Number(it.quantity),
    0,
  )
  const total = subtotal + Number(shipping || 0)

  const sb = supabaseAdmin()

  // Insert order (retry once on the very unlikely order_number collision)
  let orderRow: { id: string; order_number: string } | null = null
  for (let attempt = 0; attempt < 3 && !orderRow; attempt++) {
    const order_number = generateOrderNumber()
    const { data, error } = await sb
      .from('orders')
      .insert({
        order_number,
        user_id: userId ?? null,
        email: customer.email,
        phone: customer.phone ?? null,
        first_name: customer.firstName ?? null,
        last_name: customer.lastName ?? null,
        address1: customer.address1 ?? null,
        address2: customer.address2 ?? null,
        city: customer.city ?? null,
        state: customer.state ?? null,
        zip: customer.zip ?? null,
        country: customer.country ?? 'US',
        subtotal: subtotal.toFixed(2),
        shipping: Number(shipping || 0).toFixed(2),
        total: total.toFixed(2),
        status: payment?.status === 'paid' ? 'paid' : 'pending',
        payment_status: payment?.status ?? 'pending',
        payment_method: payment?.method ?? null,
        transaction_id: payment?.transactionId ?? null,
        auth_code: payment?.authCode ?? null,
      })
      .select('id, order_number')
      .single()

    if (!error) {
      orderRow = data
      break
    }
    // 23505 = unique_violation on order_number → retry with a new number
    if (error.code !== '23505') {
      console.error('Order insert failed:', error)
      return NextResponse.json({ error: 'Could not save order' }, { status: 500 })
    }
  }

  if (!orderRow) {
    return NextResponse.json({ error: 'Could not generate a unique order number' }, { status: 500 })
  }

  // Insert items
  const itemRows = items.map((it) => ({
    order_id: orderRow!.id,
    product_id: it.product_id ?? null,
    title: it.title,
    slug: it.slug ?? null,
    size: it.size ?? null,
    image: it.image ?? null,
    quantity: it.quantity,
    unit_price: Number(it.unit_price).toFixed(2),
    line_total: (Number(it.unit_price) * Number(it.quantity)).toFixed(2),
  }))

  const { error: itemsError } = await sb.from('order_items').insert(itemRows)
  if (itemsError) {
    // Roll back the order so we don't leave an order with no items
    await sb.from('orders').delete().eq('id', orderRow.id)
    console.error('Order items insert failed:', itemsError)
    return NextResponse.json({ error: 'Could not save order items' }, { status: 500 })
  }

  // Upsert the customer profile (best-effort — never fail the order on this).
  // Only include provided fields so a later order can't blank out existing data.
  const customerRow: Record<string, string> = { email: customer.email }
  if (customer.firstName) customerRow.first_name = customer.firstName
  if (customer.lastName) customerRow.last_name = customer.lastName
  if (customer.phone) customerRow.phone = customer.phone
  if (userId) customerRow.user_id = userId
  const { error: customerError } = await sb
    .from('customers')
    .upsert(customerRow, { onConflict: 'email' })
  if (customerError) console.error('Customer upsert failed (non-fatal):', customerError)

  return NextResponse.json({
    success: true,
    orderNumber: orderRow.order_number,
    orderId: orderRow.id,
    subtotal,
    total,
  })
}
