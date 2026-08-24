/**
 * Clover Ecommerce API helpers (server-only — uses the secret private token).
 * Wraps the Charges endpoint. Card data never passes through here: the browser
 * tokenises via Clover.js (using the public token) and we only ever handle the
 * resulting single-use source token (clv_...).
 */

import { getStoredCredentials } from '@/lib/paymentCredentials'

type CloverConfig = { merchantId: string; privateToken: string; isSandbox: boolean }

// Admin-saved credentials (payment_credentials table) win over env vars, so
// the admin UI's edits actually take effect without a redeploy. Re-read on
// every call rather than caching — a saved credential can change at runtime.
async function cloverConfig(): Promise<CloverConfig | null> {
  const stored = await getStoredCredentials('clover')
  const merchantId = stored.merchantId || process.env.CLOVER_MERCHANT_ID
  const privateToken = stored.privateToken || process.env.CLOVER_PRIVATE_TOKEN
  if (!merchantId || !privateToken) return null
  return { merchantId, privateToken, isSandbox: (stored.mode || process.env.CLOVER_MODE) !== 'production' }
}

/** Whether Clover credentials are present. If false, this gateway is unavailable. */
export async function cloverConfigured(): Promise<boolean> {
  return (await cloverConfig()) !== null
}

/**
 * Non-secret Clover values the checkout page needs client-side to mount
 * Clover.js and tokenise a card. Public token and merchant ID are meant to
 * reach the browser (they were literally NEXT_PUBLIC_* env vars before this
 * table existed) — only the private token is confidential.
 */
export async function cloverPublicCredentials(): Promise<{
  publicToken: string | null
  merchantId: string | null
  isSandbox: boolean
}> {
  const stored = await getStoredCredentials('clover')
  const publicToken = stored.publicToken || process.env.NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN || null
  const merchantId = stored.merchantId || process.env.NEXT_PUBLIC_CLOVER_MERCHANT_ID || null
  const isSandbox = (stored.mode || process.env.CLOVER_MODE) !== 'production'
  return { publicToken, merchantId, isSandbox }
}

function chargesEndpoint(isSandbox: boolean): string {
  return isSandbox
    ? 'https://scl-sandbox.dev.clover.com/v1/charges'
    : 'https://scl.dev.clover.com/v1/charges'
}

export type ChargeParams = {
  source: string
  amount: string
  currency?: string
  clientIp?: string
  description?: string
}

export type ChargeResult =
  | { ok: true; chargeId: string; status: string; raw: unknown }
  | { ok: false; error: string; code?: string; raw?: unknown }

export async function cloverCharge(params: ChargeParams): Promise<ChargeResult> {
  const cfg = await cloverConfig()
  if (!cfg) return { ok: false, error: 'Payment configuration missing' }
  if (!params.source) return { ok: false, error: 'Missing payment token' }

  const amountCents = Math.round(Number(params.amount) * 100)

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${cfg.privateToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    if (params.clientIp) headers['X-Forwarded-For'] = params.clientIp

    const res = await fetch(chargesEndpoint(cfg.isSandbox), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        amount: amountCents,
        currency: params.currency || 'usd',
        source: params.source,
        capture: true,
        description: params.description,
      }),
    })
    const data = await res.json().catch(() => ({}))

    if (res.ok && data.id && data.paid === true && data.status !== 'failed') {
      return { ok: true, chargeId: data.id, status: data.status, raw: data }
    }
    return {
      ok: false,
      error: data.message || data.error?.message || 'Payment declined',
      code: data.error?.code,
      raw: data,
    }
  } catch (err) {
    console.error('Clover charge error:', err)
    return { ok: false, error: 'Failed to connect to payment processor' }
  }
}
