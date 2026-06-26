import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAdminUser } from '@/lib/supabase/admin-auth'

export type AdminOrder = {
  id: string
  order_number: string
  email: string
  first_name: string | null
  last_name: string | null
  total: number
  currency: string
  status: string
  payment_status: string
  tracking_number: string | null
  item_count: number
  created_at: string
}

export async function getOrders(): Promise<AdminOrder[]> {
  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('orders')
    .select(
      'id, order_number, email, first_name, last_name, total, currency, status, payment_status, tracking_number, created_at, order_items(id)',
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getOrders failed:', error)
    return []
  }

  return (data ?? []).map((o) => ({
    id: o.id,
    order_number: o.order_number,
    email: o.email,
    first_name: o.first_name,
    last_name: o.last_name,
    total: Number(o.total),
    currency: o.currency,
    status: o.status,
    payment_status: o.payment_status,
    tracking_number: o.tracking_number,
    item_count: Array.isArray(o.order_items) ? o.order_items.length : 0,
    created_at: o.created_at,
  }))
}

export type OrderItem = {
  title: string
  slug: string | null
  size: string | null
  image: string | null
  quantity: number
  unit_price: number
  line_total: number
}

export type OrderDetail = {
  id: string
  order_number: string
  email: string
  phone: string | null
  first_name: string | null
  last_name: string | null
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  subtotal: number
  shipping: number
  discount: number
  coupon_code: string | null
  total: number
  currency: string
  status: string
  payment_status: string
  payment_method: string | null
  transaction_id: string | null
  tracking_number: string | null
  tracking_carrier: string | null
  created_at: string
  items: OrderItem[]
}

export async function getOrderDetail(id: string): Promise<OrderDetail | null> {
  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('orders')
    .select(
      '*, order_items(title, slug, size, image, quantity, unit_price, line_total)',
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('getOrderDetail failed:', error)
    return null
  }
  if (!data) return null

  return {
    id: data.id,
    order_number: data.order_number,
    email: data.email,
    phone: data.phone,
    first_name: data.first_name,
    last_name: data.last_name,
    address1: data.address1,
    address2: data.address2,
    city: data.city,
    state: data.state,
    zip: data.zip,
    country: data.country,
    subtotal: Number(data.subtotal),
    shipping: Number(data.shipping),
    discount: Number(data.discount ?? 0),
    coupon_code: data.coupon_code ?? null,
    total: Number(data.total),
    currency: data.currency,
    status: data.status,
    payment_status: data.payment_status,
    payment_method: data.payment_method,
    transaction_id: data.transaction_id,
    tracking_number: data.tracking_number,
    tracking_carrier: data.tracking_carrier,
    created_at: data.created_at,
    items: (data.order_items ?? []).map((it: Record<string, unknown>) => ({
      title: it.title as string,
      slug: (it.slug as string) ?? null,
      size: (it.size as string) ?? null,
      image: (it.image as string) ?? null,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
      line_total: Number(it.line_total),
    })),
  }
}

export type AdminCustomer = {
  email: string
  name: string
  orders: number
  totalSpent: number
  lastOrderAt: string
}

/**
 * Customers read from the `customers` table, enriched with order stats
 * (order count, total spent on paid orders, last order date).
 */
export async function getCustomers(): Promise<AdminCustomer[]> {
  const sb = supabaseAdmin()
  const [{ data: customers, error: cErr }, { data: orders, error: oErr }] = await Promise.all([
    sb.from('customers').select('email, first_name, last_name, created_at'),
    sb.from('orders').select('email, total, payment_status, created_at'),
  ])

  if (cErr || oErr) {
    console.error('getCustomers failed:', cErr || oErr)
    return []
  }

  // Aggregate order stats by email
  type Stat = { orders: number; totalSpent: number; lastOrderAt: string | null }
  const stats = new Map<string, Stat>()
  for (const o of orders ?? []) {
    const email = (o.email || '').toLowerCase()
    if (!email) continue
    const s = stats.get(email) ?? { orders: 0, totalSpent: 0, lastOrderAt: null }
    s.orders += 1
    if (o.payment_status === 'paid') s.totalSpent += Number(o.total)
    if (!s.lastOrderAt || new Date(o.created_at) > new Date(s.lastOrderAt)) s.lastOrderAt = o.created_at
    stats.set(email, s)
  }

  return (customers ?? [])
    .map((c) => {
      const email = (c.email || '').toLowerCase()
      const s = stats.get(email)
      const name = [c.first_name, c.last_name].filter(Boolean).join(' ').trim()
      return {
        email,
        name: name || '—',
        orders: s?.orders ?? 0,
        totalSpent: s?.totalSpent ?? 0,
        lastOrderAt: s?.lastOrderAt ?? c.created_at,
      }
    })
    .sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime())
}

export type AdminProfile = { email: string; name: string; role: string }

/** The signed-in admin's profile (from the admins table, with metadata fallback). */
export async function getAdminProfile(): Promise<AdminProfile | null> {
  const user = await getAdminUser()
  if (!user?.email) return null
  const sb = supabaseAdmin()
  const { data } = await sb
    .from('admins')
    .select('name, role')
    .ilike('email', user.email.toLowerCase())
    .maybeSingle()
  const meta = (user.user_metadata ?? {}) as { name?: string; full_name?: string }
  return {
    email: user.email,
    name: data?.name ?? meta.name ?? meta.full_name ?? '',
    role: data?.role ?? 'admin',
  }
}
