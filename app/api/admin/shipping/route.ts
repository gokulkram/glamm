import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { setShippingConfig } from '@/lib/settings'

export const runtime = 'nodejs'

// Update the storefront shipping rates (admin only).
export async function PATCH(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { freeThreshold?: number; standardRate?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const result = await setShippingConfig({
    freeThreshold: Number(body.freeThreshold),
    standardRate: Number(body.standardRate),
  })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ success: true })
}
