import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CLAIM_MAX_NOTE, CLAIM_STATUSES } from '@/lib/claims'

export const runtime = 'nodejs'

// Work a damage claim: move its status and leave a note for the customer.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { status?: string; admin_note?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (body.status && !CLAIM_STATUSES.includes(body.status as (typeof CLAIM_STATUSES)[number])) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  if (typeof body.admin_note === 'string' && body.admin_note.length > CLAIM_MAX_NOTE) {
    return NextResponse.json(
      { error: `Please keep the note under ${CLAIM_MAX_NOTE} characters.` },
      { status: 400 },
    )
  }

  const update: Record<string, string | null> = {}
  if (body.status) update.status = body.status
  // An emptied note clears it rather than storing a blank string.
  if (body.admin_note !== undefined) update.admin_note = body.admin_note.trim() || null

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('order_claims')
    .update(update)
    .eq('id', params.id)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('Update order claim failed:', error)
    return NextResponse.json({ error: 'Could not update claim' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
