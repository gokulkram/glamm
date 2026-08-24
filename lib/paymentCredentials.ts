import { supabaseAdmin } from '@/lib/supabase/admin'
import { retryQuery } from '@/lib/supabase/retry'

export type PaymentGateway = 'stripe' | 'clover'

/**
 * Stored credential overrides for a gateway. Lives in payment_credentials,
 * NOT app_settings — that table has a public select RLS policy, so it can
 * never hold secrets. This table has no read policy at all; only the
 * service-role client (supabaseAdmin(), which bypasses RLS) can reach it.
 *
 * Fails open to {} on any error so callers fall back to env vars instead of
 * breaking checkout when the table is missing or a read blips.
 */
export async function getStoredCredentials(gateway: PaymentGateway): Promise<Record<string, string>> {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await retryQuery('getStoredCredentials', () =>
      sb.from('payment_credentials').select('value').eq('gateway', gateway).maybeSingle(),
    )
    if (error) console.error(`getStoredCredentials(${gateway}) failed:`, error)
    if (error || !data) return {}
    const v = (data.value ?? {}) as Record<string, unknown>
    const out: Record<string, string> = {}
    for (const [k, val] of Object.entries(v)) {
      if (typeof val === 'string' && val) out[k] = val
    }
    return out
  } catch {
    return {}
  }
}

/**
 * Merge `patch` onto the gateway's stored credentials. A field left
 * undefined/blank in `patch` keeps its existing stored value — this is what
 * makes the write-only admin form safe: leaving a secret input blank on save
 * means "don't change it", never "clear it". Pass an explicit empty string is
 * likewise treated as "leave unchanged"; there is deliberately no way to
 * clear a field back to "use the environment value" from this function.
 */
export async function setStoredCredentials(
  gateway: PaymentGateway,
  patch: Record<string, string | undefined>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const existing = await getStoredCredentials(gateway)
    const merged = { ...existing }
    for (const [k, v] of Object.entries(patch)) {
      if (typeof v === 'string' && v.trim()) merged[k] = v.trim()
    }
    const sb = supabaseAdmin()
    const { error } = await sb
      .from('payment_credentials')
      .upsert({ gateway, value: merged }, { onConflict: 'gateway' })
    if (error) {
      console.error(`setStoredCredentials(${gateway}) failed:`, error)
      return { ok: false, error: 'Could not save credentials (has payment-credentials.sql been run?)' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save credentials' }
  }
}
