/**
 * Shipping policy (US). Rates are stored in the database (admin-editable) and
 * fall back to these defaults. The same compute function is used by the server
 * (authoritative pricing) and the storefront UI so totals always match.
 */
export type ShippingConfig = {
  /** Free standard shipping at/above this merchandise subtotal ($). */
  freeThreshold: number
  /** Flat standard shipping charged below the threshold ($). */
  standardRate: number
}

export const DEFAULT_SHIPPING: ShippingConfig = {
  freeThreshold: 100,
  standardRate: 8.99,
}

/** Standard shipping cost for a given merchandise subtotal. */
export function computeShipping(subtotal: number, cfg: ShippingConfig = DEFAULT_SHIPPING): number {
  if (subtotal <= 0) return 0
  return subtotal >= cfg.freeThreshold ? 0 : cfg.standardRate
}

/** Amount remaining to qualify for free shipping (0 once qualified). */
export function freeShippingRemaining(subtotal: number, cfg: ShippingConfig = DEFAULT_SHIPPING): number {
  return Math.max(0, Number((cfg.freeThreshold - subtotal).toFixed(2)))
}
