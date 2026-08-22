import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getMyOrderDetail } from '@/lib/account/data'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendDamageClaimNotification } from '@/lib/email'
import {
  CLAIM_BUCKET,
  CLAIM_MAX_DESCRIPTION,
  CLAIM_MAX_PHOTOS,
  isClaimable,
} from '@/lib/claims'

export const runtime = 'nodejs'

type ClaimInput = { description?: unknown; photo_paths?: unknown }

// Files the customer's damage report against an order they own.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const order = await getMyOrderDetail(params.id)
  if (!order) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isClaimable(order.status)) {
    return NextResponse.json({ error: 'This order is not eligible for a damage report.' }, { status: 400 })
  }

  let input: ClaimInput
  try {
    input = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const description = typeof input.description === 'string' ? input.description.trim() : ''
  if (!description) {
    return NextResponse.json({ error: 'Please describe the damage.' }, { status: 400 })
  }
  if (description.length > CLAIM_MAX_DESCRIPTION) {
    return NextResponse.json(
      { error: `Please keep the description under ${CLAIM_MAX_DESCRIPTION} characters.` },
      { status: 400 },
    )
  }

  const raw = Array.isArray(input.photo_paths) ? input.photo_paths : []
  // Paths come back from our own upload route, but they arrive via the client,
  // so only accept ones inside this order's folder — otherwise a customer
  // could attach another order's photos to their claim.
  const photo_paths = raw
    .filter((p): p is string => typeof p === 'string')
    .map((p) => p.trim())
    .filter((p) => p.startsWith(`${order.id}/`) && !p.includes('..'))

  if (photo_paths.length === 0) {
    return NextResponse.json({ error: 'Please attach at least one photo of the damage.' }, { status: 400 })
  }
  if (photo_paths.length > CLAIM_MAX_PHOTOS) {
    return NextResponse.json({ error: `Please attach no more than ${CLAIM_MAX_PHOTOS} photos.` }, { status: 400 })
  }

  const user = await getCurrentUser()
  const sb = supabaseAdmin()

  const { data, error } = await sb
    .from('order_claims')
    .insert({
      order_id: order.id,
      user_id: user?.id ?? null,
      kind: 'damaged',
      description,
      photo_paths,
    })
    .select('id')
    .single()

  if (error) {
    // The unique index on order_id is what stops a second claim, so a
    // duplicate lands here rather than as a validation failure above.
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A damage report has already been filed for this order.' },
        { status: 409 },
      )
    }
    console.error('Create order claim failed:', error)
    return NextResponse.json({ error: 'Could not submit your report' }, { status: 500 })
  }

  // Support is notified by email; a failure there must not lose the claim,
  // which is already saved and visible in the admin panel.
  await sendDamageClaimNotification({
    orderNumber: order.order_number,
    orderId: order.id,
    email: order.email,
    customerName: `${order.first_name ?? ''} ${order.last_name ?? ''}`.trim(),
    description,
    photoCount: photo_paths.length,
  })

  return NextResponse.json({ success: true, id: data.id })
}

// Removes an uploaded photo the customer dropped by mistake, before the
// claim is filed. Only untouched paths inside their own order's folder.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const order = await getMyOrderDetail(params.id)
  if (!order) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const path = new URL(req.url).searchParams.get('path') ?? ''
  if (!path.startsWith(`${order.id}/`) || path.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const sb = supabaseAdmin()
  // A filed claim owns its photos — only unattached uploads may be removed.
  const { data: claim } = await sb
    .from('order_claims')
    .select('id')
    .eq('order_id', order.id)
    .maybeSingle()
  if (claim) {
    return NextResponse.json({ error: 'This report has already been submitted.' }, { status: 409 })
  }

  const { error } = await sb.storage.from(CLAIM_BUCKET).remove([path])
  if (error) {
    console.error('Claim photo delete failed:', error)
    return NextResponse.json({ error: 'Could not remove photo' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
