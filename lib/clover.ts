/**
 * Clover Ecommerce API helpers (server-only — uses the secret private token).
 * Wraps the Charges endpoint. Card data never passes through here: the browser
 * tokenises via Clover.js (using the public token) and we only ever handle the
 * resulting single-use source token (clv_...).
 */

type CloverConfig = { merchantId: string; privateToken: string; isSandbox: boolean }

function cloverConfig(): CloverConfig | null {
  const merchantId = process.env.CLOVER_MERCHANT_ID
  const privateToken = process.env.CLOVER_PRIVATE_TOKEN
  if (!merchantId || !privateToken) return null
  return { merchantId, privateToken, isSandbox: process.env.CLOVER_MODE !== 'production' }
}

/** Whether Clover credentials are present. If false, this gateway is unavailable. */
export function cloverConfigured(): boolean {
  return cloverConfig() !== null
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
  const cfg = cloverConfig()
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
