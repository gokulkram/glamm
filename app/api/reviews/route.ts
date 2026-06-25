import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getApprovedReviews, getRatingSummary, createReview } from '@/lib/reviews'

export const runtime = 'nodejs'

// GET /api/reviews?productId=123 — approved reviews + rating summary (public).
export async function GET(req: NextRequest) {
  const productId = Number(new URL(req.url).searchParams.get('productId'))
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
  }
  const [reviews, summary] = await Promise.all([
    getApprovedReviews(productId),
    getRatingSummary(productId),
  ])
  return NextResponse.json({ reviews, summary }, { headers: { 'Cache-Control': 'no-store' } })
}

// POST /api/reviews — submit a review (must be signed in). Goes to "pending".
export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Please log in to write a review' }, { status: 401 })
  }

  let body: { product_id?: number; rating?: number; title?: string; body?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const meta = (user.user_metadata ?? {}) as { first_name?: string; last_name?: string }
  const authorName =
    [meta.first_name, meta.last_name].filter(Boolean).join(' ').trim() ||
    user.email?.split('@')[0] ||
    'Customer'

  const result = await createReview({
    product_id: Number(body.product_id),
    user_id: user.id,
    author_name: authorName,
    rating: Number(body.rating),
    title: body.title,
    body: body.body,
  })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ success: true })
}
