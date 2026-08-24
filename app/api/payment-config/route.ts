import { NextResponse } from 'next/server'
import { getPaymentGatewayConfig } from '@/lib/settings'
import { cloverPublicCredentials } from '@/lib/clover'
import { stripePublishableKey } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Public: which payment gateways are enabled, plus the non-secret values
// checkout needs to mount each gateway's SDK (publishable key/public token/
// merchant ID are all meant to reach the browser; no-store so an admin edit
// takes effect immediately without a redeploy).
export async function GET() {
  const [gateways, clover, stripeKey] = await Promise.all([
    getPaymentGatewayConfig(),
    cloverPublicCredentials(),
    stripePublishableKey(),
  ])
  return NextResponse.json(
    {
      ...gateways,
      cloverPublicToken: clover.publicToken,
      cloverMerchantId: clover.merchantId,
      cloverSandbox: clover.isSandbox,
      stripePublishableKey: stripeKey ?? null,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
