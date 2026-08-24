import Stripe from 'stripe'
import { getStoredCredentials } from '@/lib/paymentCredentials'

/**
 * Server-only Stripe client. Admin-saved credentials (payment_credentials
 * table) win over env vars, so the admin UI's edits take effect without a
 * redeploy; falls back to STRIPE_SECRET_KEY when nothing's been saved, so the
 * app still boots before keys are set anywhere.
 *
 * No client caching (there used to be a lazy singleton) — a saved key can
 * change at runtime, and caching across calls would keep serving a stale
 * client after a credentials save. Stripe SDK construction is cheap.
 */
async function resolveStripeSecretKey(): Promise<string | undefined> {
  const stored = await getStoredCredentials('stripe')
  return stored.secretKey || process.env.STRIPE_SECRET_KEY
}

export async function getStripe(): Promise<Stripe | null> {
  const key = await resolveStripeSecretKey()
  if (!key) return null
  return new Stripe(key)
}

/** True when a secret key is configured, saved or env (card payments available). */
export async function stripeConfigured(): Promise<boolean> {
  return !!(await resolveStripeSecretKey())
}

/** Publishable key for the browser — not secret, safe to expose via a public API. */
export async function stripePublishableKey(): Promise<string | undefined> {
  const stored = await getStoredCredentials('stripe')
  return stored.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
}
