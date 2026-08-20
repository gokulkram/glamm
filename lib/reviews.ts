import { supabaseAdmin } from '@/lib/supabase/admin'

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type Review = {
  id: number
  product_id: number
  author_name: string
  rating: number
  title: string | null
  body: string | null
  status: ReviewStatus
  created_at: string
}

export type RatingSummary = { average: number; count: number }

const COLUMNS = 'id, product_id, author_name, rating, title, body, status, created_at'

// Postgres: column does not exist.
const UNDEFINED_COLUMN = '42703'

/**
 * Read reviews in the order the admin arranged them (`sort_order`), with rows
 * nobody has placed yet falling back to newest-first. The trailing `id` keeps
 * the sequence stable, which drag-to-reorder depends on — it derives positions
 * from this order.
 *
 * Retries without `sort_order` when supabase/reorder-reviews.sql hasn't been
 * run yet, so product pages don't lose every review in the meantime.
 */
async function readReviews(opts: { productId?: number; approvedOnly?: boolean } = {}): Promise<Review[]> {
  const sb = supabaseAdmin()
  const build = () => {
    let q = sb.from('reviews').select(COLUMNS)
    if (opts.productId !== undefined) q = q.eq('product_id', opts.productId)
    if (opts.approvedOnly) q = q.eq('status', 'approved')
    return q
  }

  const { data, error } = await build()
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
  if (!error) return (data as Review[]) ?? []
  if (error.code !== UNDEFINED_COLUMN) throw error

  const legacy = await build()
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
  if (legacy.error) throw legacy.error
  return (legacy.data as Review[]) ?? []
}

/**
 * Public reviews are bylined with the first name only, so a full name never
 * reaches the storefront or the public /api/reviews payload. The admin list
 * reads through getAllReviews and still sees the name as it was submitted.
 */
function firstNameOnly(review: Review): Review {
  const first = review.author_name.trim().split(/\s+/)[0]
  return first ? { ...review, author_name: first } : review
}

/** Approved reviews for a product, in the admin's chosen order. */
export async function getApprovedReviews(productId: number): Promise<Review[]> {
  try {
    return (await readReviews({ productId, approvedOnly: true })).map(firstNameOnly)
  } catch {
    return []
  }
}

/** Average rating + count of approved reviews for a product. */
export async function getRatingSummary(productId: number): Promise<RatingSummary> {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('status', 'approved')
    if (error || !data || data.length === 0) return { average: 0, count: 0 }
    const ratings = data as { rating: number }[]
    const sum = ratings.reduce((s, r) => s + Number(r.rating), 0)
    return { average: Number((sum / ratings.length).toFixed(1)), count: ratings.length }
  } catch {
    return { average: 0, count: 0 }
  }
}

/**
 * All reviews (admin), in the hand-arranged order.
 *
 * Deliberately not grouped by status any more: the list is what the admin
 * drags rows around in, so what it shows has to be the stored order. The
 * moderation queue is a status filter in the table instead.
 */
export async function getAllReviews(): Promise<Review[]> {
  try {
    return await readReviews()
  } catch {
    return []
  }
}

export async function createReview(input: {
  product_id: number
  user_id?: string | null
  author_name: string
  rating: number
  title?: string
  body?: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const rating = Math.round(Number(input.rating))
  if (!Number.isInteger(input.product_id)) return { ok: false, error: 'Invalid product' }
  if (!(rating >= 1 && rating <= 5)) return { ok: false, error: 'Please choose a rating from 1 to 5 stars' }
  if (!input.author_name?.trim()) return { ok: false, error: 'A name is required' }
  try {
    const sb = supabaseAdmin()
    const { error } = await sb.from('reviews').insert({
      product_id: input.product_id,
      user_id: input.user_id ?? null,
      author_name: input.author_name.trim().slice(0, 80),
      rating,
      title: input.title?.trim().slice(0, 120) || null,
      body: input.body?.trim().slice(0, 2000) || null,
      status: 'pending',
    })
    if (error) {
      console.error('createReview failed:', error)
      return { ok: false, error: 'Could not submit your review (has reviews.sql been run?)' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not submit your review' }
  }
}

export async function setReviewStatus(id: number, status: ReviewStatus) {
  const sb = supabaseAdmin()
  return sb.from('reviews').update({ status }).eq('id', id)
}

export async function deleteReview(id: number) {
  const sb = supabaseAdmin()
  return sb.from('reviews').delete().eq('id', id)
}
