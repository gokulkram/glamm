import { supabaseAdmin } from '@/lib/supabase/admin'

export type CouponType = 'percent' | 'fixed'

export type Coupon = {
  id: string
  code: string
  type: CouponType
  value: number
  active: boolean
  minSubtotal: number
  startsAt: string | null
  expiresAt: string | null
  maxRedemptions: number | null
  perCustomerLimit: number
  timesRedeemed: number
  createdAt: string
}

type CouponRow = {
  id: string
  code: string
  type: CouponType
  value: number | string
  active: boolean
  min_subtotal: number | string
  starts_at: string | null
  expires_at: string | null
  max_redemptions: number | null
  per_customer_limit: number
  times_redeemed: number
  created_at: string
}

export const COUPON_COLUMNS =
  'id, code, type, value, active, min_subtotal, starts_at, expires_at, max_redemptions, per_customer_limit, times_redeemed, created_at'

export function mapCoupon(r: CouponRow): Coupon {
  return {
    id: r.id,
    code: r.code,
    type: r.type,
    value: Number(r.value),
    active: r.active,
    minSubtotal: Number(r.min_subtotal),
    startsAt: r.starts_at,
    expiresAt: r.expires_at,
    maxRedemptions: r.max_redemptions,
    perCustomerLimit: r.per_customer_limit,
    timesRedeemed: r.times_redeemed,
    createdAt: r.created_at,
  }
}

/**
 * Pure: the discount amount for a given subtotal, rounded to cents and capped so
 * it can never exceed the subtotal (the order total never goes negative).
 */
export function computeDiscount(
  coupon: { type: CouponType; value: number },
  subtotal: number,
): number {
  if (!(subtotal > 0)) return 0
  const raw = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value
  const capped = Math.min(Math.max(raw, 0), subtotal)
  return Math.round(capped * 100) / 100
}

export type ValidateResult =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; message: string }

/**
 * Validate a coupon code against a cart subtotal and (optional) customer email.
 * Enforces: exists, active, date window, minimum subtotal, total redemption cap,
 * and once-per-customer (by email). Returns the computed discount when valid.
 */
export async function validateCoupon(
  codeRaw: string,
  subtotal: number,
  email?: string | null,
): Promise<ValidateResult> {
  const code = codeRaw?.trim().toUpperCase()
  if (!code) return { ok: false, message: 'Enter a discount code' }

  const sb = supabaseAdmin()
  const { data, error } = await sb.from('coupons').select(COUPON_COLUMNS).eq('code', code).maybeSingle()
  if (error) {
    console.error('validateCoupon failed:', error)
    return { ok: false, message: 'Could not check that code right now' }
  }
  if (!data) return { ok: false, message: "That code isn't valid" }

  const coupon = mapCoupon(data as CouponRow)

  if (!coupon.active) return { ok: false, message: 'That code is no longer active' }
  const now = Date.now()
  if (coupon.startsAt && now < Date.parse(coupon.startsAt)) {
    return { ok: false, message: "That code isn't active yet" }
  }
  if (coupon.expiresAt && now > Date.parse(coupon.expiresAt)) {
    return { ok: false, message: 'That code has expired' }
  }
  if (subtotal < coupon.minSubtotal) {
    return { ok: false, message: `Add at least $${coupon.minSubtotal.toFixed(2)} to use this code` }
  }
  if (coupon.maxRedemptions != null && coupon.timesRedeemed >= coupon.maxRedemptions) {
    return { ok: false, message: 'That code has reached its usage limit' }
  }

  // Once per customer (by email).
  const normEmail = email?.trim().toLowerCase()
  if (normEmail && coupon.perCustomerLimit > 0) {
    const { count, error: rErr } = await sb
      .from('coupon_redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_id', coupon.id)
      .eq('email', normEmail)
    if (rErr) console.error('redemption check failed:', rErr)
    if ((count ?? 0) >= coupon.perCustomerLimit) {
      return { ok: false, message: 'You have already used this code' }
    }
  }

  const discount = computeDiscount(coupon, subtotal)
  if (discount <= 0) return { ok: false, message: 'This code gives no discount on your cart' }
  return { ok: true, coupon, discount }
}

/**
 * Record a coupon redemption and bump the usage counter. Best-effort and
 * idempotent: the unique (coupon, email) index means a repeat insert is ignored
 * and the counter is only incremented for a genuinely new redemption. Never
 * throws — a paid order must not fail because of bookkeeping.
 */
export async function recordRedemption(args: {
  code: string
  email: string
  userId?: string | null
  orderId?: string | null
}): Promise<void> {
  const code = args.code?.trim().toUpperCase()
  const email = args.email?.trim().toLowerCase()
  if (!code || !email) return

  const sb = supabaseAdmin()
  const { data: coupon } = await sb.from('coupons').select('id, times_redeemed').eq('code', code).maybeSingle()
  if (!coupon) return

  const { error } = await sb.from('coupon_redemptions').insert({
    coupon_id: coupon.id,
    code,
    email,
    user_id: args.userId ?? null,
    order_id: args.orderId ?? null,
  })
  if (error) {
    // 23505 = already redeemed for this email; not an error worth surfacing.
    if (error.code !== '23505') console.error('recordRedemption insert failed:', error)
    return
  }
  await sb
    .from('coupons')
    .update({ times_redeemed: (coupon.times_redeemed ?? 0) + 1 })
    .eq('id', coupon.id)
}

// ---------- Admin helpers ----------

export async function listCoupons(): Promise<Coupon[]> {
  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('coupons')
    .select(COUPON_COLUMNS)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('listCoupons failed:', error)
    return []
  }
  return (data as CouponRow[]).map(mapCoupon)
}

export async function getCouponById(id: string): Promise<Coupon | null> {
  const sb = supabaseAdmin()
  const { data, error } = await sb.from('coupons').select(COUPON_COLUMNS).eq('id', id).maybeSingle()
  if (error) {
    console.error('getCouponById failed:', error)
    return null
  }
  return data ? mapCoupon(data as CouponRow) : null
}
