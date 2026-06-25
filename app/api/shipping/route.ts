import { NextResponse } from 'next/server'
import { getShippingConfig } from '@/lib/settings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Public: current shipping rates, for the storefront UI to display.
// no-store so an admin rate change is reflected immediately (no CDN caching).
export async function GET() {
  return NextResponse.json(await getShippingConfig(), {
    headers: { 'Cache-Control': 'no-store' },
  })
}
