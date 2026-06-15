import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Update the signed-in customer's profile (name + phone)
export async function PATCH(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { firstName?: string; lastName?: string; phone?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const firstName = body.firstName?.trim() ?? ''
  const lastName = body.lastName?.trim() ?? ''
  const phone = body.phone?.trim() ?? ''

  const sb = supabaseAdmin()

  // Update the customer profile (linked by email / user_id)
  const { error: custErr } = await sb.from('customers').upsert(
    {
      email: user.email.toLowerCase(),
      user_id: user.id,
      first_name: firstName || null,
      last_name: lastName || null,
      phone: phone || null,
    },
    { onConflict: 'email' },
  )
  if (custErr) {
    console.error('Update profile (customer) failed:', custErr)
    return NextResponse.json({ error: 'Could not update profile' }, { status: 500 })
  }

  // Keep auth metadata in sync (used to prefill checkout)
  await sb.auth.admin.updateUserById(user.id, {
    user_metadata: { first_name: firstName, last_name: lastName },
  })

  return NextResponse.json({ success: true })
}
