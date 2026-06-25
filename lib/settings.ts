import { supabaseAdmin } from '@/lib/supabase/admin'
import { DEFAULT_SHIPPING, type ShippingConfig } from '@/lib/checkout/shipping'
import { DEFAULT_PRODUCT_CONTENT, type ProductContent } from '@/lib/content'

const SHIPPING_KEY = 'shipping'
const PRODUCT_CONTENT_KEY = 'product_content'

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

/**
 * Site-wide product content (Hair Care + Shipping & Returns). Falls back to
 * defaults if the table/row is missing, so product pages keep working.
 */
export async function getProductContent(): Promise<ProductContent> {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('app_settings')
      .select('value')
      .eq('key', PRODUCT_CONTENT_KEY)
      .maybeSingle()
    if (error || !data) return DEFAULT_PRODUCT_CONTENT
    const v = (data.value ?? {}) as Partial<ProductContent>
    return {
      care: typeof v.care === 'string' && v.care.trim() ? v.care : DEFAULT_PRODUCT_CONTENT.care,
      shipping: typeof v.shipping === 'string' && v.shipping.trim() ? v.shipping : DEFAULT_PRODUCT_CONTENT.shipping,
    }
  } catch {
    return DEFAULT_PRODUCT_CONTENT
  }
}

export async function setProductContent(
  content: ProductContent,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const care = String(content.care ?? '').trim()
  const shipping = String(content.shipping ?? '').trim()
  if (!care || !shipping) {
    return { ok: false, error: 'Both Hair Care and Shipping content are required' }
  }
  try {
    const sb = supabaseAdmin()
    const { error } = await sb
      .from('app_settings')
      .upsert({ key: PRODUCT_CONTENT_KEY, value: { care, shipping } }, { onConflict: 'key' })
    if (error) {
      console.error('setProductContent failed:', error)
      return { ok: false, error: 'Could not save content (has settings.sql been run?)' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save content' }
  }
}
