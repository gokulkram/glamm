import { NextRequest, NextResponse } from 'next/server'
import { priceCart, type CartLineInput } from '@/lib/checkout/pricing'
import { valorGetClientToken } from '@/lib/valor'

export const runtime = 'nodejs'

// Returns a Valor client token for the Passage.js card form. The charge amount
// is recomputed from DB prices here — the browser never decides the total.
export async function POST(request: NextRequest) {
  let body: { items?: CartLineInput[]; amount?: string }
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  // Prefer server-priced cart; fall back to a client amount only if no items
  // were sent (keeps older callers working, but the secured path sends items).
  let amount: string
  if (Array.isArray(body.items) && body.items.length > 0) {
    const priced = await priceCart(body.items)
    if ('error' in priced) {
      return NextResponse.json({ error: priced.error }, { status: 400 })
    }
    amount = priced.cart.total.toFixed(2)
  } else {
    amount = String(body.amount ?? '1.00')
  }

  const result = await valorGetClientToken(amount)
  if (!result.ok) {
    const status = result.error === 'Payment configuration missing' ? 500 : 400
    return NextResponse.json({ error: result.error, details: result.code }, { status })
  }

  return NextResponse.json({
    success: true,
    clientToken: result.clientToken,
    validity: result.validity,
    epi: result.epi,
    isDemo: result.isDemo,
    amount,
  })
}
