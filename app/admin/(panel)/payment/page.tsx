import { getPaymentGatewayConfig } from '@/lib/settings'
import { stripeConfigured } from '@/lib/stripe'
import { cloverConfigured } from '@/lib/clover'
import PaymentStatusPanel from './PaymentStatusPanel'
import PaymentGatewayForm from './PaymentGatewayForm'
import PaymentCredentialsForm from './PaymentCredentialsForm'

export const dynamic = 'force-dynamic'

export default async function AdminPaymentPage() {
  const [gateways, cloverIsConfigured, stripeIsConfigured] = await Promise.all([
    getPaymentGatewayConfig(),
    cloverConfigured(),
    stripeConfigured(),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Payment</h1>
        <p className="text-text-muted text-sm">Which payment gateways are configured, and which are enabled at checkout</p>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold mb-1">Status</h2>
        <p className="text-text-muted text-sm mb-4">
          What&apos;s currently in effect for each gateway — edit it in Credentials below.
        </p>
        <PaymentStatusPanel />
      </div>

      <div>
        <h2 className="text-lg font-bold mb-1">Enabled at checkout</h2>
        <p className="text-text-muted text-sm mb-4">
          Turn a configured gateway off without touching environment variables.
        </p>
        <PaymentGatewayForm
          initial={gateways}
          stripeConfigured={stripeIsConfigured}
          cloverConfigured={cloverIsConfigured}
        />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold mb-1">Credentials</h2>
        <p className="text-text-muted text-sm mb-4">
          Keys and tokens for each gateway. Secret fields are write-only — saving a blank one
          leaves it unchanged.
        </p>
        <PaymentCredentialsForm />
      </div>
    </div>
  )
}
