import { supabaseAdmin } from '@/lib/supabase/admin'
import { retryQuery } from '@/lib/supabase/retry'
import { sanitizeRichText } from '@/lib/richText'
import { DEFAULT_SHIPPING, type ShippingConfig } from '@/lib/checkout/shipping'
import {
  DEFAULT_PRODUCT_CONTENT,
  DEFAULT_TESTIMONIALS_SECTION,
  DEFAULT_HERO,
  type HeroContent,
  type HeroStat,
  type ProductContent,
  type TestimonialsSection,
} from '@/lib/content'

const SHIPPING_KEY = 'shipping'
const PRODUCT_CONTENT_KEY = 'product_content'
const TESTIMONIALS_SECTION_KEY = 'testimonials_section'
const HERO_KEY = 'hero'

/**
 * Read the shipping config from the DB. Falls back to defaults if the
 * app_settings table/row doesn't exist yet, so the storefront keeps working
 * before supabase/settings.sql has been run.
 */
export async function getShippingConfig(): Promise<ShippingConfig> {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await retryQuery('getShippingConfig', () =>
      sb.from('app_settings').select('value').eq('key', SHIPPING_KEY).maybeSingle(),
    )
    // A failed read is not an unset row, and used to go unlogged — which left
    // a broken connection looking exactly like a setting nobody had saved yet.
    if (error) console.error('getShippingConfig failed:', error)
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
    const { data, error } = await retryQuery('getProductContent', () =>
      sb.from('app_settings').select('value').eq('key', PRODUCT_CONTENT_KEY).maybeSingle(),
    )
    // A failed read is not an unset row, and used to go unlogged — which left
    // a broken connection looking exactly like a setting nobody had saved yet.
    if (error) console.error('getProductContent failed:', error)
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
    // Authored as HTML in the admin editor and rendered with
    // dangerouslySetInnerHTML on every product page, so clean it on the way in.
    const { error } = await sb
      .from('app_settings')
      .upsert(
        {
          key: PRODUCT_CONTENT_KEY,
          value: { care: sanitizeRichText(care), shipping: sanitizeRichText(shipping) },
        },
        { onConflict: 'key' },
      )
    if (error) {
      console.error('setProductContent failed:', error)
      return { ok: false, error: 'Could not save content (has settings.sql been run?)' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save content' }
  }
}

/**
 * The heading wording above the homepage testimonial carousel. Falls back to
 * the shipped copy if the table/row is missing, so the section never renders
 * with blanks.
 */
export async function getTestimonialsSection(): Promise<TestimonialsSection> {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await retryQuery('getTestimonialsSection', () =>
      sb.from('app_settings').select('value').eq('key', TESTIMONIALS_SECTION_KEY).maybeSingle(),
    )
    // A failed read is not an unset row, and used to go unlogged — which left
    // a broken connection looking exactly like a setting nobody had saved yet.
    if (error) console.error('getTestimonialsSection failed:', error)
    if (error || !data) return DEFAULT_TESTIMONIALS_SECTION
    const v = (data.value ?? {}) as Partial<TestimonialsSection>
    const pick = (k: keyof TestimonialsSection) =>
      typeof v[k] === 'string' && v[k]!.trim() ? (v[k] as string) : DEFAULT_TESTIMONIALS_SECTION[k]
    return { eyebrow: pick('eyebrow'), heading: pick('heading') }
  } catch {
    return DEFAULT_TESTIMONIALS_SECTION
  }
}

export async function setTestimonialsSection(
  section: TestimonialsSection,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const value = {
    eyebrow: String(section.eyebrow ?? '').trim().slice(0, 120),
    heading: String(section.heading ?? '').trim().slice(0, 120),
  }
  if (!value.heading) return { ok: false, error: 'A heading is required' }
  try {
    const sb = supabaseAdmin()
    const { error } = await sb
      .from('app_settings')
      .upsert({ key: TESTIMONIALS_SECTION_KEY, value }, { onConflict: 'key' })
    if (error) {
      console.error('setTestimonialsSection failed:', error)
      return { ok: false, error: 'Could not save the section (has settings.sql been run?)' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save the section' }
  }
}

/**
 * The homepage hero. Falls back to the shipped copy field by field, so a blank
 * value in the row can never render an empty headline — the hero is the first
 * thing on the site and there's nothing behind it to fall back to.
 */
export async function getHero(): Promise<HeroContent> {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await retryQuery('getHero', () =>
      sb.from('app_settings').select('value').eq('key', HERO_KEY).maybeSingle(),
    )
    if (error) console.error('getHero failed:', error)
    if (error || !data) return DEFAULT_HERO
    return mergeHero((data.value ?? {}) as Partial<HeroContent>)
  } catch {
    return DEFAULT_HERO
  }
}

/** Take each field from the saved row only when it's a non-empty string. */
function mergeHero(v: Partial<HeroContent>): HeroContent {
  const pick = (k: keyof Omit<HeroContent, 'stats'>) =>
    typeof v[k] === 'string' && (v[k] as string).trim() ? (v[k] as string).trim() : DEFAULT_HERO[k]

  const saved = Array.isArray(v.stats) ? v.stats : []
  const stats = DEFAULT_HERO.stats.map((fallback, i) => {
    const s = (saved[i] ?? {}) as Partial<HeroStat>
    return {
      value: typeof s.value === 'string' && s.value.trim() ? s.value.trim() : fallback.value,
      label: typeof s.label === 'string' && s.label.trim() ? s.label.trim() : fallback.label,
    }
  }) as [HeroStat, HeroStat, HeroStat]

  return {
    badge: pick('badge'),
    headingTop: pick('headingTop'),
    headingBottom: pick('headingBottom'),
    subtitle: pick('subtitle'),
    subtitleAccent: pick('subtitleAccent'),
    primaryLabel: pick('primaryLabel'),
    primaryHref: pick('primaryHref'),
    secondaryLabel: pick('secondaryLabel'),
    secondaryHref: pick('secondaryHref'),
    image: pick('image'),
    stats,
    socialCount: pick('socialCount'),
    socialLabel: pick('socialLabel'),
  }
}

/**
 * A hero link has to be a path on this site or a full http(s) URL. Free text
 * would otherwise sail through and leave a dead call-to-action on the homepage
 * — and `javascript:` would be worse than dead.
 */
function badLink(href: string): string | null {
  if (href.startsWith('/')) return null
  if (/^https?:\/\//i.test(href)) return null
  return `"${href}" must start with / or be a full http(s) address`
}

export async function setHero(
  hero: HeroContent,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Merge first: blank fields mean "use the shipped copy", not "store empty".
  const value = mergeHero(hero)
  for (const href of [value.primaryHref, value.secondaryHref]) {
    const problem = badLink(href)
    if (problem) return { ok: false, error: problem }
  }
  try {
    const sb = supabaseAdmin()
    const { error } = await sb
      .from('app_settings')
      .upsert({ key: HERO_KEY, value }, { onConflict: 'key' })
    if (error) {
      console.error('setHero failed:', error)
      return { ok: false, error: 'Could not save the hero (has settings.sql been run?)' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save the hero' }
  }
}
