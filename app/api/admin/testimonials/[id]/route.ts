import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { deleteTestimonial, updateTestimonial } from '@/lib/testimonials'

export const runtime = 'nodejs'

// Edit a testimonial, or show/hide it on the homepage.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid testimonial id' }, { status: 400 })
  }

  let body: { headline?: string; quote?: string; initial?: string; rating?: number; is_active?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const result = await updateTestimonial(id, body)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  revalidatePath('/')
  return NextResponse.json({ success: true, warning: result.warning })
}

// Delete a testimonial.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid testimonial id' }, { status: 400 })
  }

  const result = await deleteTestimonial(id)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  revalidatePath('/')
  return NextResponse.json({ success: true })
}
