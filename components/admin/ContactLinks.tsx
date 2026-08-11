import { Mail, Phone } from 'lucide-react'

/**
 * Gateway names as stored on `orders.payment_method` (see the checkout routes),
 * mapped to something readable. Anything unrecognised is de-slugged rather
 * than shown raw — `capitalize` alone turns "valor_card" into "Valor_card".
 */
const PAYMENT_LABELS: Record<string, string> = {
  valor: 'Valor (card)',
  valor_card: 'Valor (card)',
  clover: 'Clover (card)',
  stripe: 'Stripe',
  paypal: 'PayPal',
  manual: 'Manual / offline',
}

export function paymentLabel(method: string | null): string {
  if (!method) return '—'
  return (
    PAYMENT_LABELS[method.toLowerCase()] ??
    method.replace(/[_-]+/g, ' ').replace(/^./, (c) => c.toUpperCase())
  )
}

/**
 * Phone numbers are free text captured at checkout, so they arrive in every
 * shape a customer felt like typing. Show what they wrote, but dial only the
 * digits (keeping a leading + for international numbers).
 */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

const linkClass =
  'inline-flex items-center gap-1.5 text-text-muted hover:text-accent hover:underline underline-offset-2'

export function EmailLink({ email, showIcon = true }: { email: string; showIcon?: boolean }) {
  return (
    <a href={`mailto:${email}`} className={linkClass} title={`Email ${email}`}>
      {showIcon && <Mail className="h-3.5 w-3.5 shrink-0" />}
      <span className="truncate">{email}</span>
    </a>
  )
}

export function PhoneLink({
  phone,
  showIcon = true,
}: {
  phone: string | null
  showIcon?: boolean
}) {
  if (!phone) return <span className="text-text-muted/50">—</span>
  return (
    <a href={telHref(phone)} className={linkClass} title={`Call ${phone}`}>
      {showIcon && <Phone className="h-3.5 w-3.5 shrink-0" />}
      <span className="whitespace-nowrap">{phone}</span>
    </a>
  )
}
