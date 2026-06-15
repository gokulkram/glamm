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

function pick(input: AddressInput) {
  const row: Record<string, string> = {}
  for (const f of FIELDS) {
    const v = input[f]
    if (typeof v === 'string' && v.trim()) row[f] = v.trim()
  }
  return row
}

// List the signed-in user's addresses
export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('List addresses failed:', error)
    return NextResponse.json({ error: 'Could not load addresses' }, { status: 500 })
  }
  return NextResponse.json({ addresses: data ?? [] })
}

// Create an address
export async function POST(req: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let input: AddressInput
  try {
    input = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const row = pick(input)
  if (!row.address1) return NextResponse.json({ error: 'Street address is required' }, { status: 400 })

  const sb = supabaseAdmin()

  // First address becomes the default automatically
  const { count } = await sb
    .from('addresses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  const makeDefault = input.is_default === true || (count ?? 0) === 0

  if (makeDefault) {
    await sb.from('addresses').update({ is_default: false }).eq('user_id', user.id)
  }

  const { data, error } = await sb
    .from('addresses')
    .insert({ ...row, user_id: user.id, is_default: makeDefault })
    .select('*')
    .single()

  if (error) {
    console.error('Create address failed:', error)
    return NextResponse.json({ error: 'Could not save address' }, { status: 500 })
  }
  return NextResponse.json({ success: true, address: data })
}
