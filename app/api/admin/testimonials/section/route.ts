import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { setTestimonialsSection } from '@/lib/settings'

export const runtime = 'nodejs'

// Update the heading block above the homepage carousel (admin only).
export async function PATCH(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { eyebrow?: string; heading?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const result = await setTestimonialsSection({ eyebrow: body.eyebrow ?? '', heading: body.heading ?? '' })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  revalidatePath('/')
  return NextResponse.json({ success: true })
}
