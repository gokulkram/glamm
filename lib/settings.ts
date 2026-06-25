import { supabaseAdmin } from '@/lib/supabase/admin'
import { DEFAULT_SHIPPING, type ShippingConfig } from '@/lib/checkout/shipping'

const SHIPPING_KEY = 'shipping'

/**
 * Read the shipping config from the DB. Falls back to defaults if the
 * app_settings table/row doesn't exist yet, so the storefront keeps working
 * before supabase/settings.sql has been run.
 */
export async function getShippingConfig(): Promise<ShippingConfig> {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('app_settings')
      .select('value')
      .eq('key', SHIPPING_KEY)
      .maybeSingle()
    if (error || !data) return DEFAULT_SHIPPING
    const v = (data.value ?? {}) as Partial<ShippingConfig>
    const freeThreshold = Number(v.freeThreshold)
    const standardRate = Number(v.standardRate)
    return {
      freeThreshold: Number.isFinite(freeThreshold) ? freeThreshold : DEFAULT_SHIPPING.freeThreshold,
      standardRate: Number.isFinite(standardRate) ? standardRate : DEFAULT_SHIPPING.standardRate,
    }
  } catch {
    return DEFAULT_SHIPPING
  }
}

export async function setShippingConfig(
  cfg: ShippingConfig,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const freeThreshold = Number(cfg.freeThreshold)
  const standardRate = Number(cfg.standardRate)
  if (!Number.isFinite(freeThreshold) || freeThreshold < 0) {
    return { ok: false, error: 'Free-shipping threshold must be 0 or more' }
  }
  if (!Number.isFinite(standardRate) || standardRate < 0) {
    return { ok: false, error: 'Shipping rate must be 0 or more' }
  }
  try {
    const sb = supabaseAdmin()
    const { error } = await sb
      .from('app_settings')
      .upsert({ key: SHIPPING_KEY, value: { freeThreshold, standardRate } }, { onConflict: 'key' })
    if (error) {
      console.error('setShippingConfig failed:', error)
      return { ok: false, error: 'Could not save settings (has settings.sql been run?)' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save settings' }
  }
}
