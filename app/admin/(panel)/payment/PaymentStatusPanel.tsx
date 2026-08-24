import { stripeConfigured, stripePublishableKey } from '@/lib/stripe'
import { cloverConfigured, cloverPublicCredentials } from '@/lib/clover'
import { getStoredCredentials } from '@/lib/paymentCredentials'

// Same color convention as the order-status Badge in
// app/admin/(panel)/orders/[id]/page.tsx, reused here for consistency.
const badge: Record<string, string> = {
  configured: 'bg-green-100 text-green-700',
  missing: 'bg-gray-100 text-gray-600',
  live: 'bg-red-100 text-red-700',
  test: 'bg-yellow-100 text-yellow-700',
}

function Pill({ tone, children }: { tone: keyof typeof badge; children: React.ReactNode }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge[tone]}`}>{children}</span>
  )
}

/** One line in a gateway's credential checklist. */
function EnvRow({ label, present }: { label: string; present: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-muted">{label}</span>
      <Pill tone={present ? 'configured' : 'missing'}>{present ? 'Set' : 'Missing'}</Pill>
    </div>
  )
}

/**
 * Read-only view of whether Stripe and Clover are configured, and in what
 * mode — an admin-saved credential (payment_credentials table, edited on the
 * Credentials form below) wins over the matching env var, so this reflects
 * whichever one is actually in effect right now.
 */
export default async function PaymentStatusPanel() {
  const [stripeReady, stripePubKey, stripeStored, cloverReady, cloverPublic, cloverStored] = await Promise.all([
    stripeConfigured(),
    stripePublishableKey(),
    getStoredCredentials('stripe'),
    cloverConfigured(),
    cloverPublicCredentials(),
    getStoredCredentials('clover'),
  ])

  const stripeSecretInEffect = stripeStored.secretKey || process.env.STRIPE_SECRET_KEY
  const stripeMode = stripeSecretInEffect?.startsWith('sk_live_')
    ? 'live'
    : stripeSecretInEffect?.startsWith('sk_test_')
      ? 'test'
      : null
  const webhookSecretSet = Boolean(process.env.STRIPE_WEBHOOK_SECRET)

  const cloverPrivateTokenSet = Boolean(cloverStored.privateToken || process.env.CLOVER_PRIVATE_TOKEN)
  const cloverMode = cloverPublic.isSandbox ? 'test' : 'live'

  return (
    <div className="card p-6 max-w-xl space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">Stripe</span>
          <Pill tone={stripeReady ? 'configured' : 'missing'}>{stripeReady ? 'Configured' : 'Not configured'}</Pill>
          {stripeReady && stripeMode && <Pill tone={stripeMode}>{stripeMode === 'live' ? 'Live mode' : 'Test mode'}</Pill>}
        </div>
        <div className="space-y-1 pl-0.5">
          <EnvRow label="Secret key" present={Boolean(stripeSecretInEffect)} />
          <EnvRow label="Publishable key" present={Boolean(stripePubKey)} />
          <EnvRow label="Webhook secret" present={webhookSecretSet} />
        </div>
        <p className="text-xs text-text-muted mt-2">
          Webhook secret is set via environment only — it&apos;s issued by Stripe when the webhook
          endpoint is registered in your Stripe Dashboard and must match exactly on both sides, so
          it isn&apos;t editable here.
        </p>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">Clover</span>
          <Pill tone={cloverReady ? 'configured' : 'missing'}>{cloverReady ? 'Configured' : 'Not configured'}</Pill>
          {cloverReady && <Pill tone={cloverMode}>{cloverMode === 'live' ? 'Live mode' : 'Test mode'}</Pill>}
        </div>
        <div className="space-y-1 pl-0.5">
          <EnvRow label="Public token" present={Boolean(cloverPublic.publicToken)} />
          <EnvRow label="Merchant ID" present={Boolean(cloverPublic.merchantId)} />
          <EnvRow label="Private token" present={cloverPrivateTokenSet} />
        </div>
      </div>

      <p className="text-xs text-text-muted border-t border-border pt-4">
        A saved value from the Credentials form below takes priority over the matching environment
        variable. A customer who reaches checkout with neither gateway configured is offered
        pay-on-delivery instead of a card charge.
      </p>
    </div>
  )
}
