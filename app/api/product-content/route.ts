import { NextResponse } from 'next/server'
import { getProductContent } from '@/lib/settings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Public: site-wide product content (Hair Care + Shipping & Returns).
export async function GET() {
  return NextResponse.json(await getProductContent(), {
    headers: { 'Cache-Control': 'no-store' },
  })
}
