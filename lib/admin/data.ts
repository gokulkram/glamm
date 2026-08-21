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
  auth_code: string | null
  tracking_number: string | null
  tracking_carrier: string | null
  created_at: string
  updated_at: string | null
  /** `customers.id` for this order's email, so the order can link to them. */
  customerId: string | null
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

  // Match the order to a customer record so the page can link to their
  // profile. Orders keep their own copy of the email, so this is a lookup
  // rather than a foreign key, and a guest order may have no match at all.
  const { data: customer } = await sb
    .from('customers')
    .select('id')
    .ilike('email', (data.email ?? '').toLowerCase().replace(/[%_\\]/g, '\\$&'))
    .maybeSingle()

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
    auth_code: data.auth_code ?? null,
    tracking_number: data.tracking_number,
    tracking_carrier: data.tracking_carrier,
    created_at: data.created_at,
    updated_at: data.updated_at ?? null,
    customerId: customer?.id ?? null,
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
  id: string
  email: string
  name: string
  phone: string | null
  city: string | null
  state: string | null
  orders: number
  totalSpent: number
  lastOrderAt: string
}

/**
 * Customers read from the `customers` table, enriched with order stats
 * (order count, total spent on paid orders, last order date) plus the phone
 * and city/state from their most recent order.
 *
 * There is no address on `customers` — every address in this system is the
 * snapshot an order was shipped to, so "where a customer is" means "where
 * their latest order went".
 */
export async function getCustomers(): Promise<AdminCustomer[]> {
  const sb = supabaseAdmin()
  const [{ data: customers, error: cErr }, { data: orders, error: oErr }] = await Promise.all([
    sb.from('customers').select('id, email, first_name, last_name, phone, created_at'),
    sb.from('orders').select('email, total, payment_status, created_at, phone, city, state'),
  ])

  if (cErr || oErr) {
    console.error('getCustomers failed:', cErr || oErr)
    return []
  }

  // Aggregate order stats by email
  type Stat = {
    orders: number
    totalSpent: number
    lastOrderAt: string | null
    phone: string | null
    city: string | null
    state: string | null
  }
  const stats = new Map<string, Stat>()
  for (const o of orders ?? []) {
    const email = (o.email || '').toLowerCase()
    if (!email) continue
    const s =
      stats.get(email) ??
      { orders: 0, totalSpent: 0, lastOrderAt: null, phone: null, city: null, state: null }
    s.orders += 1
    if (o.payment_status === 'paid') s.totalSpent += Number(o.total)
    if (!s.lastOrderAt || new Date(o.created_at) > new Date(s.lastOrderAt)) {
      s.lastOrderAt = o.created_at
      // Contact details travel with the newest order, not the first one seen.
      s.phone = o.phone ?? null
      s.city = o.city ?? null
      s.state = o.state ?? null
    }
    stats.set(email, s)
  }

  return (customers ?? [])
    .map((c) => {
      const email = (c.email || '').toLowerCase()
      const s = stats.get(email)
      const name = [c.first_name, c.last_name].filter(Boolean).join(' ').trim()
      return {
        id: c.id as string,
        email,
        name: name || '—',
        phone: c.phone ?? s?.phone ?? null,
        city: s?.city ?? null,
        state: s?.state ?? null,
        orders: s?.orders ?? 0,
        totalSpent: s?.totalSpent ?? 0,
        lastOrderAt: s?.lastOrderAt ?? c.created_at,
      }
    })
    .sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime())
}

export type CustomerAddress = {
  first_name: string | null
  last_name: string | null
  phone: string | null
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
}

export type CustomerOrderSummary = {
  id: string
  order_number: string
  total: number
  currency: string
  status: string
  payment_status: string
  created_at: string
}

export type CustomerDetail = {
  id: string
  email: string
  name: string
  /** The stored parts, for the admin edit form. */
  firstName: string
  lastName: string
  /**
   * `phone` falls back to the latest order's phone when the customer record
   * has none. This is the value actually on the customer row, so the edit form
   * doesn't save an address-derived number back as if it had been typed.
   */
  phoneOnRecord: string
  phone: string | null
  createdAt: string
  hasAccount: boolean
  stats: { orders: number; totalSpent: number; lastOrderAt: string | null }
  /** Where their most recent order shipped. */
  latestAddress: CustomerAddress | null
  /** Every other distinct address they've shipped to, newest first. */
  pastAddresses: CustomerAddress[]
  /** Address book — only populated once a customer registers an account. */
  savedAddresses: (CustomerAddress & { id: string; isDefault: boolean })[]
  orders: CustomerOrderSummary[]
}

/** Identity for an address, so the same place isn't listed twice. */
function addressKey(a: CustomerAddress): string {
  return [a.address1, a.address2, a.city, a.state, a.zip, a.country]
    .map((v) => (v ?? '').trim().toLowerCase())
    .join('|')
}

function hasAddress(a: CustomerAddress): boolean {
  return Boolean(a.address1 || a.city || a.zip)
}

/**
 * One customer with everything known about them: contact details, every
 * address they've shipped to, their saved address book (registered accounts
 * only) and their order history.
 *
 * Looked up by `customers.id` rather than email so no address is put in a URL.
 * Orders join on email with `ilike`, because the schema indexes
 * `lower(email)` — case drift between the two tables is expected.
 */
export async function getCustomerDetail(id: string): Promise<CustomerDetail | null> {
  const sb = supabaseAdmin()

  const { data: customer, error: cErr } = await sb
    .from('customers')
    .select('id, email, first_name, last_name, phone, user_id, created_at')
    .eq('id', id)
    .maybeSingle()

  if (cErr) {
    console.error('getCustomerDetail failed:', cErr)
    return null
  }
  if (!customer) return null

  const email = (customer.email || '').toLowerCase()

  const [{ data: orders, error: oErr }, { data: saved }] = await Promise.all([
    sb
      .from('orders')
      // Keep this select on one line — supabase-js infers the row type from the
      // string literal, and concatenation defeats that.
      .select('id, order_number, total, currency, status, payment_status, created_at, first_name, last_name, phone, address1, address2, city, state, zip, country')
      // `ilike` is a LIKE pattern, so `_` and `%` in an address would match
      // other customers' emails. Escape them — case-insensitive matching is
      // the only thing wanted here.
      .ilike('email', email.replace(/[%_\\]/g, '\\$&'))
      .order('created_at', { ascending: false }),
    customer.user_id
      ? sb
          .from('addresses')
          .select('*')
          .eq('user_id', customer.user_id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
  ])

  if (oErr) {
    console.error('getCustomerDetail orders failed:', oErr)
    return null
  }

  const rows = orders ?? []

  // Addresses in order-newest-first, deduped. The first one is where their
  // most recent order went; the rest are places they've shipped to before.
  const seen = new Set<string>()
  const addresses: CustomerAddress[] = []
  for (const o of rows) {
    const a: CustomerAddress = {
      first_name: o.first_name ?? null,
      last_name: o.last_name ?? null,
      phone: o.phone ?? null,
      address1: o.address1 ?? null,
      address2: o.address2 ?? null,
      city: o.city ?? null,
      state: o.state ?? null,
      zip: o.zip ?? null,
      country: o.country ?? null,
    }
    if (!hasAddress(a)) continue
    const key = addressKey(a)
    if (seen.has(key)) continue
    seen.add(key)
    addresses.push(a)
  }

  const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ').trim()

  return {
    id: customer.id,
    email,
    name: name || '—',
    firstName: customer.first_name ?? '',
    lastName: customer.last_name ?? '',
    phoneOnRecord: customer.phone ?? '',
    phone: customer.phone ?? addresses[0]?.phone ?? null,
    createdAt: customer.created_at,
    hasAccount: Boolean(customer.user_id),
    stats: {
      orders: rows.length,
      totalSpent: rows
        .filter((o) => o.payment_status === 'paid')
        .reduce((sum, o) => sum + Number(o.total), 0),
      lastOrderAt: rows[0]?.created_at ?? null,
    },
    latestAddress: addresses[0] ?? null,
    pastAddresses: addresses.slice(1),
    savedAddresses: (saved ?? []).map((a) => ({
      id: a.id as string,
      isDefault: Boolean(a.is_default),
      first_name: (a.first_name as string) ?? null,
      last_name: (a.last_name as string) ?? null,
      phone: (a.phone as string) ?? null,
      address1: (a.address1 as string) ?? null,
      address2: (a.address2 as string) ?? null,
      city: (a.city as string) ?? null,
      state: (a.state as string) ?? null,
      zip: (a.zip as string) ?? null,
      country: (a.country as string) ?? null,
    })),
    orders: rows.map((o) => ({
      id: o.id,
      order_number: o.order_number,
      total: Number(o.total),
      currency: o.currency,
      status: o.status,
      payment_status: o.payment_status,
      created_at: o.created_at,
    })),
  }
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
