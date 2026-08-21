import { NextResponse } from 'next/server'
import { getProductContent } from '@/lib/settings'
import { renderRichText } from '@/lib/richText'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Public: site-wide product content (Hair Care + Shipping & Returns).
export async function GET() {
  // The product page drops this straight into the DOM and is a client
  // component, so it can't sanitise for itself — hand it HTML that is already
  // clean. This also converts the shipped defaults, still line-based.
  const content = await getProductContent()
  return NextResponse.json({
    care: renderRichText(content.care),
    shipping: renderRichText(content.shipping),
  }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
