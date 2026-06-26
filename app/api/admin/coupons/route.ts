import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { buildCouponRow, type CouponInput } from '@/lib/admin/couponPayload'

export const runtime = 'nodejs'

// Create a coupon
export async function POST(req: NextRequest) {
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
  const { data, error: insertError } = await sb.from('coupons').insert(row).select('id').single()

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'A coupon with that code already exists' }, { status: 409 })
    }
    console.error('Create coupon failed:', insertError)
    return NextResponse.json({ error: 'Could not create coupon' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id })
}
