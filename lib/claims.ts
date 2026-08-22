import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Damage claims: a customer reports a damaged delivery with photos, support
 * works it from the admin order page.
 *
 * Photos live in a PRIVATE bucket — unlike product/blog images, these are
 * customer content tied to an order. Rows store storage paths and the app
 * signs a short-lived URL at view time, so nothing is publicly readable.
 */
export const CLAIM_BUCKET = 'claim-photos'

/** Mirrors the admin upload routes so the two behave the same way. */
export const CLAIM_MAX_BYTES = 5 * 1024 * 1024 // 5 MB
export const CLAIM_ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
export const CLAIM_MAX_PHOTOS = 6
export const CLAIM_MAX_DESCRIPTION = 2000
/** Support's note back to the customer — same generous cap as their report. */
export const CLAIM_MAX_NOTE = 2000

/**
 * Nothing can arrive damaged before it ships, so the form only appears once
 * an order is on its way. Cancelled and refunded orders are past the point of
 * a claim, and pending/paid/processing haven't left us yet.
 */
export const CLAIMABLE_STATUSES = ['shipped', 'delivered']

export function isClaimable(status: string) {
  return CLAIMABLE_STATUSES.includes(status)
}

export const CLAIM_STATUSES = ['submitted', 'in_review', 'approved', 'rejected'] as const
export type ClaimStatus = (typeof CLAIM_STATUSES)[number]

export const CLAIM_STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  in_review: 'In review',
  approved: 'Approved',
  rejected: 'Not approved',
}

export type OrderClaim = {
  id: string
  order_id: string
  kind: string
  description: string
  photo_paths: string[]
  status: string
  admin_note: string | null
  created_at: string
}

/** A claim with viewable photo URLs signed for this render. */
export type ClaimWithPhotos = OrderClaim & { photoUrls: string[] }

const SIGNED_URL_TTL = 60 * 60 // 1 hour — long enough to read the page

/**
 * Signs each stored path for display. A path that fails to sign is dropped
 * rather than rendered as a broken image, so one missing file can't take the
 * claim panel down with it.
 */
export async function signClaimPhotos(paths: string[]): Promise<string[]> {
  if (!paths.length) return []
  const sb = supabaseAdmin()
  const { data, error } = await sb.storage.from(CLAIM_BUCKET).createSignedUrls(paths, SIGNED_URL_TTL)
  if (error) {
    console.error('signClaimPhotos failed:', error)
    return []
  }
  return (data ?? []).map((d) => d.signedUrl).filter((u): u is string => Boolean(u))
}

/** Loads the claim for an order, if one exists, with signed photo URLs. */
export async function getClaimForOrder(orderId: string): Promise<ClaimWithPhotos | null> {
  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('order_claims')
    .select('id, order_id, kind, description, photo_paths, status, admin_note, created_at')
    .eq('order_id', orderId)
    .maybeSingle()

  if (error) {
    console.error('getClaimForOrder failed:', error)
    return null
  }
  if (!data) return null

  const claim = data as OrderClaim
  return { ...claim, photoUrls: await signClaimPhotos(claim.photo_paths ?? []) }
}
