/**
 * Valor PayTech API helpers (server-only — uses the secret APP_KEY).
 * Wraps the GetClientToken and Sale endpoints so the API routes share one
 * implementation. Card data never passes through here: the browser tokenises
 * via Passage.js and we only ever handle the resulting single-use token.
 */

type ValorConfig = { appId: string; appKey: string; epi: string; isDemo: boolean }

function valorConfig(): ValorConfig | null {
  const appId = process.env.VALOR_APP_ID
  const appKey = process.env.VALOR_APP_KEY
  const epi = process.env.VALOR_EPI
  if (!appId || !appKey || !epi) return null
  return { appId, appKey, epi, isDemo: process.env.VALOR_DEMO_MODE === 'true' }
}

/** Whether Valor credentials are present. If false, the storefront falls back to manual orders. */
export function valorConfigured(): boolean {
  return valorConfig() !== null
}

function endpoint(isDemo: boolean, op: 'getClientToken' | 'sale'): string {
  // NOTE: confirm these against your Valor account's API docs before go-live.
  if (op === 'getClientToken') {
    return isDemo
      ? 'https://demo.valorpaytech.com/api/valor/getClientToken'
      : 'https://securelink.valorpaytech.com:4430/?getClientToken'
  }
  return isDemo
    ? 'https://demo.valorpaytech.com/api/valor/sale'
    : 'https://securelink.valorpaytech.com:4430/?sale'
}

export type ClientTokenResult =
  | { ok: true; clientToken: string; validity?: string; epi: string; isDemo: boolean }
  | { ok: false; error: string; code?: string }

export async function valorGetClientToken(amount: string): Promise<ClientTokenResult> {
  const cfg = valorConfig()
  if (!cfg) return { ok: false, error: 'Payment configuration missing' }

  try {
    const res = await fetch(endpoint(cfg.isDemo, 'getClientToken'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appid: cfg.appId,
        appkey: cfg.appKey,
        epi: cfg.epi,
        txn_type: 'sale',
        amount,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (data.error_no === 'S00' && data.clientToken) {
      return { ok: true, clientToken: data.clientToken, validity: data.validity, epi: cfg.epi, isDemo: cfg.isDemo }
    }
    return { ok: false, error: 'Failed to generate client token', code: data.error_code || data.error_no }
  } catch (err) {
    console.error('Valor token error:', err)
    return { ok: false, error: 'Failed to connect to payment processor' }
  }
}

export type SaleParams = {
  token: string
  amount: string
  email?: string
  phone?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
}

export type SaleResult =
  | { ok: true; transactionId?: string; authCode?: string; raw: unknown }
  | { ok: false; error: string; code?: string; raw?: unknown }

export async function valorSale(params: SaleParams): Promise<SaleResult> {
  const cfg = valorConfig()
  if (!cfg) return { ok: false, error: 'Payment configuration missing' }
  if (!params.token) return { ok: false, error: 'Missing payment token' }

  try {
    const res = await fetch(endpoint(cfg.isDemo, 'sale'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appid: cfg.appId,
        appkey: cfg.appKey,
        epi: cfg.epi,
        txn_type: 'sale',
        token: params.token,
        amount: params.amount,
        phone: params.phone || '',
        email: params.email || '',
        address1: params.address1 || '',
        address2: params.address2 || '',
        city: params.city || '',
        state: params.state || '',
        zip: params.zip || '',
        billing_country: 'US',
        shipping_country: 'US',
        surchargeIndicator: '0',
        surchargeAmount: '0.00',
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (data.error_no === 'S00' || data.errorCode === '00') {
      return { ok: true, transactionId: data.txnid || data.rrn, authCode: data.auth_code, raw: data }
    }
    return {
      ok: false,
      error: data.mesg || data.error_code || 'Payment declined',
      code: data.error_no || data.errorCode,
      raw: data,
    }
  } catch (err) {
    console.error('Valor sale error:', err)
    return { ok: false, error: 'Payment processing failed' }
  }
}
