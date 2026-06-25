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

/** Approved reviews for a product, newest first. */
export async function getApprovedReviews(productId: number): Promise<Review[]> {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('reviews')
      .select(COLUMNS)
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    if (error) return []
    return (data as Review[]) ?? []
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

/** All reviews (admin), pending first then newest. */
export async function getAllReviews(): Promise<Review[]> {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('reviews')
      .select(COLUMNS)
      .order('created_at', { ascending: false })
    if (error) return []
    const all = (data as Review[]) ?? []
    const order = { pending: 0, approved: 1, rejected: 2 } as Record<ReviewStatus, number>
    return all.sort((a, b) => order[a.status] - order[b.status])
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
