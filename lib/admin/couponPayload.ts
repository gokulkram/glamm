export type CouponInput = {
  code?: string
  type?: 'percent' | 'fixed'
  value?: number | string
  active?: boolean
  minSubtotal?: number | string
  startsAt?: string | null
  expiresAt?: string | null
  maxRedemptions?: number | string | null
  perCustomerLimit?: number | string
}

export type CouponRowInsert = {
  code: string
  type: 'percent' | 'fixed'
  value: number
  active: boolean
  min_subtotal: number
  starts_at: string | null
  expires_at: string | null
  max_redemptions: number | null
  per_customer_limit: number
}

function parseDate(v: string | null | undefined): { value: string | null; error?: string } {
  if (!v) return { value: null }
  const t = Date.parse(v)
  if (isNaN(t)) return { value: null, error: 'Invalid date' }
  return { value: new Date(t).toISOString() }
}

/** Validate an incoming coupon payload and build the DB row. */
export function buildCouponRow(input: CouponInput): { row?: CouponRowInsert; error?: string } {
  const code = input.code?.trim().toUpperCase()
  if (!code) return { error: 'Code is required' }
  if (!/^[A-Z0-9_-]+$/.test(code)) {
    return { error: 'Code can only contain letters, numbers, dashes and underscores' }
  }

  const type = input.type
  if (type !== 'percent' && type !== 'fixed') return { error: 'Choose a discount type' }

  const value = Number(input.value)
  if (!(value > 0)) return { error: 'Discount value must be greater than 0' }
  if (type === 'percent' && value > 100) return { error: 'A percentage cannot exceed 100' }

  const minSubtotal = Number(input.minSubtotal) || 0
  if (minSubtotal < 0) return { error: 'Minimum subtotal cannot be negative' }

  let maxRedemptions: number | null = null
  if (input.maxRedemptions !== null && input.maxRedemptions !== undefined && `${input.maxRedemptions}` !== '') {
    maxRedemptions = Number(input.maxRedemptions)
    if (!Number.isInteger(maxRedemptions) || maxRedemptions < 1) {
      return { error: 'Total usage limit must be a whole number of 1 or more' }
    }
  }

  // 1 = once per customer (default), 0 = no per-customer limit.
  let perCustomerLimit = Number(input.perCustomerLimit)
  if (!Number.isInteger(perCustomerLimit) || perCustomerLimit < 0) perCustomerLimit = 1

  const starts = parseDate(input.startsAt)
  if (starts.error) return { error: 'Invalid start date' }
  const expires = parseDate(input.expiresAt)
  if (expires.error) return { error: 'Invalid expiry date' }
  if (starts.value && expires.value && Date.parse(expires.value) <= Date.parse(starts.value)) {
    return { error: 'Expiry must be after the start date' }
  }

  return {
    row: {
      code,
      type,
      value,
      active: input.active ?? true,
      min_subtotal: minSubtotal,
      starts_at: starts.value,
      expires_at: expires.value,
      max_redemptions: maxRedemptions,
      per_customer_limit: perCustomerLimit,
    },
  }
}
