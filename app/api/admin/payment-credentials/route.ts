import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { getStoredCredentials, setStoredCredentials, type PaymentGateway } from '@/lib/paymentCredentials'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type FieldKind = 'text' | 'secret' | 'select'
type FieldSpec = { key: string; kind: FieldKind; envFallback?: string }

// Which fields exist per gateway, and how each should be handled: 'text'
// fields are safe to show/edit plainly (they're not confidential — publishable
// keys and public tokens are meant to reach the browser); 'secret' fields are
// write-only, only a boolean "is something set" ever leaves the server.
const FIELDS: Record<PaymentGateway, FieldSpec[]> = {
  stripe: [
    { key: 'publishableKey', kind: 'text', envFallback: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' },
    { key: 'secretKey', kind: 'secret', envFallback: 'STRIPE_SECRET_KEY' },
  ],
  clover: [
    { key: 'merchantId', kind: 'text', envFallback: 'CLOVER_MERCHANT_ID' },
    { key: 'publicToken', kind: 'text', envFallback: 'NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN' },
    { key: 'privateToken', kind: 'secret', envFallback: 'CLOVER_PRIVATE_TOKEN' },
    { key: 'mode', kind: 'select', envFallback: 'CLOVER_MODE' },
  ],
}

// Admin-only: which credential fields are set, and their values for the
// non-secret ones. GET never returns a secret field's actual value — only
// whether one is currently in effect (saved override, or env var).
export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [stripeStored, cloverStored] = await Promise.all([getStoredCredentials('stripe'), getStoredCredentials('clover')])
  const stored: Record<PaymentGateway, Record<string, string>> = { stripe: stripeStored, clover: cloverStored }

  const out: Record<string, Record<string, unknown>> = {}
  for (const gateway of Object.keys(FIELDS) as PaymentGateway[]) {
    const gatewayOut: Record<string, unknown> = {}
    for (const field of FIELDS[gateway]) {
      const savedValue = stored[gateway][field.key]
      const envValue = field.envFallback ? process.env[field.envFallback] : undefined
      const source = savedValue ? 'saved' : envValue ? 'environment' : 'none'
      if (field.kind === 'secret') {
        gatewayOut[field.key] = { set: source !== 'none', source }
      } else {
        gatewayOut[field.key] = { value: savedValue || envValue || '', source }
      }
    }
    out[gateway] = gatewayOut
  }

  return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } })
}

// Save credentials for one gateway. Blank/omitted fields leave the existing
// saved value untouched (see lib/paymentCredentials.ts) — this is what makes
// leaving a secret input blank on the form safe.
export async function PATCH(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { gateway?: string; fields?: Record<string, string> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const gateway = body.gateway
  if (gateway !== 'stripe' && gateway !== 'clover') {
    return NextResponse.json({ error: 'Unknown gateway' }, { status: 400 })
  }

  const allowedKeys = new Set(FIELDS[gateway].map((f) => f.key))
  const patch: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(body.fields ?? {})) {
    if (allowedKeys.has(k) && typeof v === 'string') patch[k] = v
  }

  if (gateway === 'clover' && patch.mode && patch.mode !== 'sandbox' && patch.mode !== 'production') {
    return NextResponse.json({ error: 'Mode must be sandbox or production' }, { status: 400 })
  }

  const result = await setStoredCredentials(gateway, patch)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ success: true })
}
