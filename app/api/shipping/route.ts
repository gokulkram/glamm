import { NextResponse } from 'next/server'
import { getShippingConfig } from '@/lib/settings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Public: current shipping rates, for the storefront UI to display.
export async function GET() {
  return NextResponse.json(await getShippingConfig())
}
