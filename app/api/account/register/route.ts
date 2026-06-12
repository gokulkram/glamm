import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

/**
 * Customer self-registration. Creates an auto-confirmed Supabase Auth user
 * (so they can log in immediately without email confirmation) and links a
 * customer row to that account. The client signs in afterwards.
 */
export async function POST(req: NextRequest) {
  let body: {
    email?: string
    password?: string
    firstName?: string
    lastName?: string
    phone?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''
  const firstName = body.firstName?.trim()
  const lastName = body.lastName?.trim()
  const phone = body.phone?.trim()

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const sb = supabaseAdmin()

  const { data, error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  })

  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 409 },
      )
    }
    console.error('Register failed:', error)
    return NextResponse.json({ error: 'Could not create account' }, { status: 500 })
  }

  // Link / create the customer profile for this account (best-effort)
  const customerRow: Record<string, string> = { email, user_id: data.user.id }
  if (firstName) customerRow.first_name = firstName
  if (lastName) customerRow.last_name = lastName
  if (phone) customerRow.phone = phone
  const { error: custErr } = await sb.from('customers').upsert(customerRow, { onConflict: 'email' })
  if (custErr) console.error('Customer link failed (non-fatal):', custErr)

  return NextResponse.json({ success: true })
}
