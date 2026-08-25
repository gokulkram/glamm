import { supabaseAdmin } from '@/lib/supabase/admin'
import { retryQuery } from '@/lib/supabase/retry'

/**
 * Stored SMTP credential overrides. Lives in mail_credentials, NOT
 * app_settings — that table has a public select RLS policy, so it can never
 * hold secrets. This table has no read policy at all; only the service-role
 * client (supabaseAdmin(), which bypasses RLS) can reach it.
 *
 * Fails open to {} on any error so callers fall back to env vars instead of
 * breaking order/shipping emails when the table is missing or a read blips.
 */
export async function getStoredMailCredentials(): Promise<Record<string, string>> {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await retryQuery('getStoredMailCredentials', () =>
      sb.from('mail_credentials').select('value').eq('provider', 'smtp').maybeSingle(),
    )
    if (error) console.error('getStoredMailCredentials failed:', error)
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
 * Merge `patch` onto the stored SMTP credentials. A field left
 * undefined/blank in `patch` keeps its existing stored value — this is what
 * makes the write-only admin form safe: leaving the password input blank on
 * save means "don't change it", never "clear it".
 */
export async function setStoredMailCredentials(
  patch: Record<string, string | undefined>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const existing = await getStoredMailCredentials()
    const merged = { ...existing }
    for (const [k, v] of Object.entries(patch)) {
      if (typeof v === 'string' && v.trim()) merged[k] = v.trim()
    }
    const sb = supabaseAdmin()
    const { error } = await sb
      .from('mail_credentials')
      .upsert({ provider: 'smtp', value: merged }, { onConflict: 'provider' })
    if (error) {
      console.error('setStoredMailCredentials failed:', error)
      return { ok: false, error: 'Could not save credentials (has mail-credentials.sql been run?)' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save credentials' }
  }
}
