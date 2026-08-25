import { getStoredMailCredentials } from '@/lib/mailCredentials'

// Same color convention as PaymentStatusPanel, reused here for consistency.
const badge: Record<string, string> = {
  configured: 'bg-green-100 text-green-700',
  missing: 'bg-gray-100 text-gray-600',
}

function Pill({ tone, children }: { tone: keyof typeof badge; children: React.ReactNode }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge[tone]}`}>{children}</span>
  )
}

function EnvRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-muted">{label}</span>
      {value ? (
        <span className="font-medium">{value}</span>
      ) : (
        <Pill tone="missing">Missing</Pill>
      )}
    </div>
  )
}

/**
 * Read-only view of whether SMTP is configured for order/shipping mail — an
 * admin-saved credential (mail_credentials table, edited on the Credentials
 * form below) wins over the matching env var, so this reflects whichever one
 * is actually in effect right now.
 */
export default async function MailStatusPanel() {
  const stored = await getStoredMailCredentials()

  const host = stored.host || process.env.SMTP_HOST || null
  const port = stored.port || process.env.SMTP_PORT || null
  const user = stored.user || process.env.SMTP_USER || null
  const from = stored.from || process.env.SMTP_FROM || null
  const passSet = Boolean(stored.pass || process.env.SMTP_PASS)
  const notify = stored.notify || process.env.ORDER_NOTIFY_EMAILS || process.env.ADMIN_EMAILS || null

  const configured = Boolean(host && user && passSet)

  return (
    <div className="card p-6 max-w-xl space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">SMTP</span>
          <Pill tone={configured ? 'configured' : 'missing'}>{configured ? 'Configured' : 'Not configured'}</Pill>
        </div>
        <div className="space-y-1 pl-0.5">
          <EnvRow label="Host" value={host} />
          <EnvRow label="Port" value={port} />
          <EnvRow label="User" value={user} />
          <EnvRow label="From" value={from} />
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Password</span>
            <Pill tone={passSet ? 'configured' : 'missing'}>{passSet ? 'Set' : 'Missing'}</Pill>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">Notify emails</span>
        </div>
        <div className="space-y-1 pl-0.5">
          <EnvRow label="Recipients" value={notify} />
        </div>
        <p className="text-xs text-text-muted mt-2">
          Who receives new order, contact form, and damage claim alerts — edited below.
        </p>
      </div>

      <p className="text-xs text-text-muted border-t border-border pt-4">
        A saved value from the Credentials form below takes priority over the matching environment
        variable. This controls order confirmation, shipping, status update, contact form, and
        damage claim emails. Password reset / sign-up emails are sent by Supabase and configured
        separately in the Supabase dashboard.
      </p>
    </div>
  )
}
