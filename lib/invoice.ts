import type { OrderDetail } from '@/lib/admin/data'

/**
 * Who the invoice is from.
 *
 * PLACEHOLDER — replace with the real legal entity before sending any of
 * these to customers. It lives here as a constant rather than in the invoice
 * markup so there is one obvious place to correct it; if it ever needs to be
 * editable from the admin panel, move it into `app_settings` alongside the
 * shipping and hero settings in lib/settings.ts.
 */
export const SELLER = {
  name: 'Glamm Hair Extensions',
  addressLines: ['[Street address]', '[City, State ZIP]', 'United States'],
  email: 'support@glammhairextensions.com',
  phone: '',
  /** Tax / EIN line. Left blank so nothing false is printed. */
  taxId: '',
}

export const money = (n: number) => `$${n.toFixed(2)}`

/**
 * Invoice number for an order. Derived from the order number rather than
 * stored, so it is stable for a given order and needs no extra column.
 */
export function invoiceNumber(order: Pick<OrderDetail, 'order_number'>) {
  return order.order_number.replace(/^GLM-/, 'INV-')
}

export function invoiceDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const PAYMENT_LABELS: Record<string, string> = {
  stripe: 'Card (Stripe)',
  clover: 'Card (Clover)',
  valor: 'Card (Valor)',
}

export function paymentMethodLabel(method: string | null) {
  if (!method) return '—'
  return PAYMENT_LABELS[method] ?? method
}

/** The recipient block, assembled from the order's own copy of the address. */
export function billTo(order: OrderDetail) {
  const name = `${order.first_name ?? ''} ${order.last_name ?? ''}`.trim()
  const cityLine = [order.city, order.state, order.zip].filter(Boolean).join(', ')
  return {
    name: name || order.email,
    lines: [order.address1, order.address2, cityLine, order.country].filter(
      (l): l is string => Boolean(l && l.trim()),
    ),
    email: order.email,
    phone: order.phone,
  }
}
