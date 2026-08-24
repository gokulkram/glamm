import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Shipping files: a shipping label, customs form, or package photo an admin
 * attaches to an order for fulfilment reference. Admin-only — never shown to
 * the customer.
 *
 * Files live in the PRIVATE `shipping-files` storage bucket. The `orders`
 * row stores their storage paths, not URLs — the app signs a short-lived
 * URL at view time so nothing is publicly readable.
 */
export const SHIPPING_FILES_BUCKET = 'shipping-files'

export const SHIPPING_FILES_MAX_BYTES = 10 * 1024 * 1024 // 10 MB
export const SHIPPING_FILES_ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
}
export const SHIPPING_FILES_MAX_COUNT = 10

const SIGNED_URL_TTL = 60 * 60 // 1 hour — long enough to read the page

const DOCUMENT_EXTS = new Set(['pdf'])

/** Derives display kind from the stored path's extension. */
export function shippingFileKind(path: string): 'photo' | 'document' {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return DOCUMENT_EXTS.has(ext) ? 'document' : 'photo'
}

export type SignedShippingFile = { path: string; url: string | null; kind: 'photo' | 'document' }

/**
 * Signs each stored path for display. A path that fails to sign is dropped
 * rather than rendered as a broken link, so one missing file can't take the
 * fulfilment panel down with it.
 */
export async function signShippingFiles(paths: string[]): Promise<SignedShippingFile[]> {
  if (!paths.length) return []
  const sb = supabaseAdmin()
  const { data, error } = await sb.storage.from(SHIPPING_FILES_BUCKET).createSignedUrls(paths, SIGNED_URL_TTL)
  if (error) {
    console.error('signShippingFiles failed:', error)
    return []
  }
  return (data ?? [])
    .filter((d): d is { error: string | null; path: string; signedUrl: string } => Boolean(d.path && d.signedUrl))
    .map((d) => ({ path: d.path, url: d.signedUrl, kind: shippingFileKind(d.path) }))
}
