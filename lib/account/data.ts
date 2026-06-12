import type { User } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getOrderDetail, type OrderDetail } from '@/lib/admin/data'

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export type MyOrderSummary = {
  id: string
  order_number: string
  total: number
  currency: string
  status: string
  payment_status: string
  tracking_number: string | null
  item_count: number
  created_at: string
}

/**
 * Returns the signed-in user's orders. Also "claims" any guest orders placed
 * with the same email (links them to this account) so past purchases appear.
 */
export async function getMyOrders(): Promise<{ user: User | null; orders: MyOrderSummary[] }> {
  const user = await getCurrentUser()
  if (!user?.email) return { user: null, orders: [] }

  const sb = supabaseAdmin()
  const email = user.email.toLowerCase()

  // Claim guest orders / customer profile by email
  await sb.from('orders').update({ user_id: user.id }).is('user_id', null).ilike('email', email)
  await sb.from('customers').update({ user_id: user.id }).is('user_id', null).ilike('email', email)

  const { data, error } = await sb
    .from('orders')
    .select(
      'id, order_number, total, currency, status, payment_status, tracking_number, created_at, order_items(id)',
    )
    .ilike('email', email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getMyOrders failed:', error)
    return { user, orders: [] }
  }

  const orders: MyOrderSummary[] = (data ?? []).map((o) => ({
    id: o.id,
    order_number: o.order_number,
    total: Number(o.total),
    currency: o.currency,
    status: o.status,
    payment_status: o.payment_status,
    tracking_number: o.tracking_number,
    item_count: Array.isArray(o.order_items) ? o.order_items.length : 0,
    created_at: o.created_at,
  }))

  return { user, orders }
}

/** Order detail, but only if it belongs to the signed-in user. */
export async function getMyOrderDetail(id: string): Promise<OrderDetail | null> {
  const user = await getCurrentUser()
  if (!user?.email) return null
  const detail = await getOrderDetail(id)
  if (!detail) return null
  if (detail.email.toLowerCase() !== user.email.toLowerCase()) return null
  return detail
}
