import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { createTestimonial } from '@/lib/testimonials'

export const runtime = 'nodejs'

// Add a homepage testimonial (appended to the end of the carousel).
export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { headline?: string; quote?: string; initial?: string; rating?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const result = await createTestimonial({
    headline: body.headline ?? '',
    quote: body.quote ?? '',
    initial: body.initial,
    rating: body.rating,
  })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  revalidatePath('/')
  return NextResponse.json({ success: true, warning: result.warning })
}
