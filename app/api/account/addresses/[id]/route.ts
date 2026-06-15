import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

async function requireUser() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

const FIELDS = ['first_name', 'last_name', 'phone', 'address1', 'address2', 'city', 'state', 'zip', 'country'] as const

type AddressInput = Partial<Record<(typeof FIELDS)[number], string>> & { is_default?: boolean }

// Update an address (or set it as default)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let input: AddressInput
  try {
    input = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const sb = supabaseAdmin()

  // Ownership check
  const { data: existing } = await sb
    .from('addresses')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 })

  const row: Record<string, string | boolean> = {}
  for (const f of FIELDS) {
    const v = input[f]
    if (typeof v === 'string') row[f] = v.trim()
  }

  if (input.is_default === true) {
    await sb.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    row.is_default = true
  }

  const { data, error } = await sb
    .from('addresses')
    .update(row)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) {
    console.error('Update address failed:', error)
    return NextResponse.json({ error: 'Could not update address' }, { status: 500 })
  }
  return NextResponse.json({ success: true, address: data })
}

// Delete an address
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = supabaseAdmin()
  const { data: removed, error } = await sb
    .from('addresses')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select('is_default')
    .maybeSingle()

  if (error) {
    console.error('Delete address failed:', error)
    return NextResponse.json({ error: 'Could not delete address' }, { status: 500 })
  }

  // If we removed the default, promote the most recent remaining address
  if (removed?.is_default) {
    const { data: next } = await sb
      .from('addresses')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (next) await sb.from('addresses').update({ is_default: true }).eq('id', next.id)
  }

  return NextResponse.json({ success: true })
}
