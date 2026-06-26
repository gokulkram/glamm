import { randomBytes } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendOrderConfirmation, sendNewOrderNotification } from '@/lib/email'
import { recordRedemption } from '@/lib/coupons'

export type OrderCustomer = {
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

export type OrderItem = {
  product_id?: number | null
  title: string
  slug?: string
  size?: string
  image?: string
  quantity: number
  unit_price: number
}

export type OrderPayment = {
  method?: string
  status?: 'pending' | 'paid' | 'failed'
  transactionId?: string
  authCode?: string
}

export type CreateOrderInput = {
  userId?: string | null
  customer: OrderCustomer
  items: OrderItem[]
  subtotal: number
  shipping?: number
  discount?: number
  couponCode?: string | null
  total: number
  payment?: OrderPayment
}

export type CreateOrderResult =
  | { ok: true; orderNumber: string; orderId: string; duplicate?: boolean }
  | { ok: false; error: string }

export type OrderSummary = {
  orderNumber: string
  subtotal: number
  shipping: number
  discount: number
  couponCode: string | null
  total: number
  currency: string
}

/** Money summary for an order, by its human-friendly number (server-side use). */
export async function getOrderSummary(orderNumber: string): Promise<OrderSummary | null> {
  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('orders')
    .select('order_number, subtotal, shipping, discount, coupon_code, total, currency')
    .eq('order_number', orderNumber)
    .maybeSingle()
  if (error || !data) {
    if (error) console.error('getOrderSummary failed:', error)
    return null
  }
  return {
    orderNumber: data.order_number,
    subtotal: Number(data.subtotal),
    shipping: Number(data.shipping),
    discount: Number(data.discount ?? 0),
    couponCode: data.coupon_code ?? null,
    total: Number(data.total),
    currency: data.currency,
  }
}

// Human-friendly order number, e.g. GLM-8F3K2A1B
function generateOrderNumber() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars
  const bytes = randomBytes(8)
  let out = ''
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length]
  return `GLM-${out}`
}

/**
 * Persist an order + its items, upsert the customer, and fire the confirmation
 * email (best-effort). When `idempotencyKey` is supplied an existing order with
 * the same key is returned instead of creating a duplicate.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const {
    userId = null,
    customer,
    items,
    subtotal,
    shipping = 0,
    discount = 0,
    couponCode = null,
    total,
    payment,
  } = input

  if (!customer?.email) return { ok: false, error: 'Customer email is required' }
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'Order must contain at least one item' }
  }

  const sb = supabaseAdmin()

  // Idempotency: a gateway transaction id (e.g. Stripe PaymentIntent) uniquely
  // identifies a payment, so if an order already exists for it, return that —
  // the return page and the webhook both finalise the same payment.
  const txnId = payment?.transactionId
  if (txnId) {
    const { data: existing } = await sb
      .from('orders')
      .select('id, order_number')
      .eq('transaction_id', txnId)
      .maybeSingle()
    if (existing) {
      return { ok: true, orderNumber: existing.order_number, orderId: existing.id, duplicate: true }
    }
  }

  // Insert order (retry on the unlikely order_number collision).
  let orderRow: { id: string; order_number: string } | null = null
  for (let attempt = 0; attempt < 3 && !orderRow; attempt++) {
    const order_number = generateOrderNumber()
    const orderInsert: Record<string, unknown> = {
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
      discount: Number(discount || 0).toFixed(2),
      coupon_code: couponCode || null,
      total: total.toFixed(2),
      status: payment?.status === 'paid' ? 'paid' : 'pending',
      payment_status: payment?.status ?? 'pending',
      payment_method: payment?.method ?? null,
      transaction_id: payment?.transactionId ?? null,
      auth_code: payment?.authCode ?? null,
    }

    const { data, error } = await sb
      .from('orders')
      .insert(orderInsert)
      .select('id, order_number')
      .single()

    if (!error) {
      orderRow = data
      break
    }
    // 23505 = unique_violation. If a concurrent request created the order for
    // this transaction first (with the optional unique index), return that one.
    if (error.code === '23505' && txnId) {
      const { data: existing } = await sb
        .from('orders')
        .select('id, order_number')
        .eq('transaction_id', txnId)
        .maybeSingle()
      if (existing) return { ok: true, orderNumber: existing.order_number, orderId: existing.id, duplicate: true }
    }
    // Otherwise it was an order_number collision → loop and try a new number.
    if (error.code !== '23505') {
      console.error('Order insert failed:', error)
      return { ok: false, error: 'Could not save order' }
    }
  }

  if (!orderRow) {
    return { ok: false, error: 'Could not generate a unique order number' }
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
    // Roll back the order so we never leave an order with no items.
    await sb.from('orders').delete().eq('id', orderRow.id)
    console.error('Order items insert failed:', itemsError)
    return { ok: false, error: 'Could not save order items' }
  }

  // Upsert the customer profile (best-effort — never fail the order on this).
  const customerRow: Record<string, string> = { email: customer.email }
  if (customer.firstName) customerRow.first_name = customer.firstName
  if (customer.lastName) customerRow.last_name = customer.lastName
  if (customer.phone) customerRow.phone = customer.phone
  if (userId) customerRow.user_id = userId
  const { error: customerError } = await sb.from('customers').upsert(customerRow, { onConflict: 'email' })
  if (customerError) console.error('Customer upsert failed (non-fatal):', customerError)

  // Record the coupon redemption on paid orders only (best-effort, idempotent).
  // This runs only on a genuinely new order — the duplicate path returns earlier.
  if (couponCode && payment?.status === 'paid') {
    recordRedemption({
      code: couponCode,
      email: customer.email,
      userId,
      orderId: orderRow.id,
    }).catch((e) => console.error('Coupon redemption record failed (non-fatal):', e))
  }

  // Order confirmation email (best-effort — never fail the order).
  sendOrderConfirmation({
    orderNumber: orderRow.order_number,
    email: customer.email,
    firstName: customer.firstName,
    items: items.map((it) => ({
      title: it.title,
      size: it.size,
      quantity: it.quantity,
      unit_price: Number(it.unit_price),
    })),
    subtotal,
    shipping: Number(shipping || 0),
    discount: Number(discount || 0),
    total,
  }).catch((e) => console.error('Order email error:', e))

  // Internal store alert (best-effort — never fail the order).
  sendNewOrderNotification({
    orderNumber: orderRow.order_number,
    customerName: `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || null,
    email: customer.email,
    phone: customer.phone,
    items: items.map((it) => ({
      title: it.title,
      size: it.size,
      quantity: it.quantity,
      unit_price: Number(it.unit_price),
    })),
    subtotal,
    shipping: Number(shipping || 0),
    discount: Number(discount || 0),
    total,
    paymentMethod: payment?.method,
    paymentStatus: payment?.status,
  }).catch((e) => console.error('New-order notification error:', e))

  return { ok: true, orderNumber: orderRow.order_number, orderId: orderRow.id }
}
