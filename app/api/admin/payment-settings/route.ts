import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { setPaymentGatewayConfig } from '@/lib/settings'

export const runtime = 'nodejs'

// Update which payment gateways checkout may use (admin only).
export async function PATCH(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { stripeEnabled?: boolean; cloverEnabled?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const result = await setPaymentGatewayConfig({
    stripeEnabled: Boolean(body.stripeEnabled),
    cloverEnabled: Boolean(body.cloverEnabled),
  })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ success: true })
}
