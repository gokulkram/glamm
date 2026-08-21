import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const MAX_NAME = 80
const MAX_PHONE = 40

/**
 * Edit a customer's name and phone.
 *
 * Email is deliberately not editable. Orders are tied to a customer by their
 * email rather than by id, so changing it here would detach every order they
 * have ever placed from them — the address book too, which is keyed on the
 * auth user behind that address.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { firstName?: string; lastName?: string; phone?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const firstName = (body.firstName ?? '').trim().slice(0, MAX_NAME)
  const lastName = (body.lastName ?? '').trim().slice(0, MAX_NAME)
  const phone = (body.phone ?? '').trim().slice(0, MAX_PHONE)

  // The storefront greets people by their first name, and the customer list
  // shows the two joined — a record with neither would read as a blank row.
  if (!firstName && !lastName) {
    return NextResponse.json({ error: 'Enter a first or last name' }, { status: 400 })
  }

  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('customers')
    // Empty means "not set" rather than an empty string, so the display
    // fallbacks further down keep working.
    .update({ first_name: firstName || null, last_name: lastName || null, phone: phone || null })
    .eq('id', params.id)
    .select('id')

  if (error) {
    console.error('Update customer failed:', error)
    return NextResponse.json({ error: 'Could not save the customer' }, { status: 500 })
  }
  if (!data?.length) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
