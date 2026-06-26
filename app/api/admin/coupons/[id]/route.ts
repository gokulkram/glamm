import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { buildCouponRow, type CouponInput } from '@/lib/admin/couponPayload'

export const runtime = 'nodejs'

// Update a coupon
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let input: CouponInput
  try {
    input = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { row, error } = buildCouponRow(input)
  if (error || !row) return NextResponse.json({ error: error ?? 'Invalid coupon' }, { status: 400 })

  const sb = supabaseAdmin()
  const { data, error: updateError } = await sb
    .from('coupons')
    .update(row)
    .eq('id', params.id)
    .select('id')
    .maybeSingle()

  if (updateError) {
    if (updateError.code === '23505') {
      return NextResponse.json({ error: 'A coupon with that code already exists' }, { status: 409 })
    }
    console.error('Update coupon failed:', updateError)
    return NextResponse.json({ error: 'Could not update coupon' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })

  return NextResponse.json({ success: true, id: data.id })
}

// Delete a coupon
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = supabaseAdmin()
  const { error } = await sb.from('coupons').delete().eq('id', params.id)
  if (error) {
    console.error('Delete coupon failed:', error)
    return NextResponse.json({ error: 'Could not delete coupon' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
