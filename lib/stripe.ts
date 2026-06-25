import Stripe from 'stripe'

/**
 * Server-only Stripe client. Reads STRIPE_SECRET_KEY at call time so the app
 * still boots (and the manual checkout keeps working) before keys are set.
 */
let _stripe: Stripe | null = null

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!_stripe) _stripe = new Stripe(key)
  return _stripe
}

/** True when the secret key is configured (card payments available). */
export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}
