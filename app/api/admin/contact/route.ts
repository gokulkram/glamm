import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { setContact } from '@/lib/settings'
import type { ContactContent } from '@/lib/content'

export const runtime = 'nodejs'

// Save the contact page. Blank fields fall back to the shipped copy and the
// link fields are validated — both handled in setContact.
export async function PATCH(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: ContactContent
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const result = await setContact(body)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
}
