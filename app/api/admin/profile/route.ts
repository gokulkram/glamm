import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Update the signed-in admin's profile (name)
export async function PATCH(req: NextRequest) {
  const user = await getAdminUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const name = body.name?.trim() ?? ''
  const sb = supabaseAdmin()

  const { error } = await sb.from('admins').upsert(
    { email: user.email.toLowerCase(), user_id: user.id, name: name || null },
    { onConflict: 'email' },
  )
  if (error) {
    console.error('Update admin profile failed:', error)
    return NextResponse.json({ error: 'Could not update profile' }, { status: 500 })
  }

  await sb.auth.admin.updateUserById(user.id, { user_metadata: { name } })

  return NextResponse.json({ success: true })
}
