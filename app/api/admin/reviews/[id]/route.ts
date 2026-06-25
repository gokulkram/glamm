import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { setReviewStatus, deleteReview, type ReviewStatus } from '@/lib/reviews'

export const runtime = 'nodejs'

const STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected']

// Approve / reject a review.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid review id' }, { status: 400 })
  }

  let body: { status?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!body.status || !STATUSES.includes(body.status as ReviewStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { error } = await setReviewStatus(id, body.status as ReviewStatus)
  if (error) {
    console.error('Update review failed:', error)
    return NextResponse.json({ error: 'Could not update review' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}

// Delete a review.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid review id' }, { status: 400 })
  }
  const { error } = await deleteReview(id)
  if (error) {
    console.error('Delete review failed:', error)
    return NextResponse.json({ error: 'Could not delete review' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
