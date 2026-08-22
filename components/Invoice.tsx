import Image from 'next/image'
import type { OrderDetail } from '@/lib/admin/data'
import {
  SELLER,
  billTo,
  invoiceDate,
  invoiceNumber,
  money,
  paymentMethodLabel,
} from '@/lib/invoice'
import PrintButton from './PrintButton'

/**
 * A printable invoice for one order.
 *
 * Deliberately plain: fixed light colours and simple borders, because this is
 * meant to survive the browser's print dialog and come out looking the same
 * on paper as on screen. The print rules live in app/globals.css.
 *
 * There is no tax line — orders carry subtotal, shipping, discount and total,
 * and no tax is collected anywhere in the checkout.
 */
export default function Invoice({ order }: { order: OrderDetail }) {
  const to = billTo(order)

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 print:px-0 print:py-0">
      <div className="mb-8 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="rounded-2xl border border-border bg-white p-8 print:rounded-none print:border-0 print:p-0">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-6">
          <div>
            {/* Unoptimized so the logo is a plain <img> in the printed sheet —
                the optimizer's srcset can otherwise leave print with nothing. */}
            <Image
              src="/glamm-logo.png"
              alt={SELLER.name}
              width={1164}
              height={548}
              className="mb-4 h-12 w-auto"
              unoptimized
              priority
            />
            <h1 className="text-2xl font-bold tracking-tight">Invoice</h1>
            <div className="mt-1 text-sm text-text-muted">{invoiceNumber(order)}</div>
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold">{SELLER.name}</div>
            {SELLER.addressLines.map((line) => (
              <div key={line} className="text-text-muted">
                {line}
              </div>
            ))}
            {SELLER.email && <div className="text-text-muted">{SELLER.email}</div>}
            {SELLER.phone && <div className="text-text-muted">{SELLER.phone}</div>}
            {SELLER.taxId && <div className="text-text-muted">Tax ID: {SELLER.taxId}</div>}
          </div>
        </div>

        {/* Meta */}
        <div className="grid gap-6 border-b border-border py-6 sm:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-text-muted">Billed to</div>
            <div className="mt-1.5 text-sm">
              <div className="font-medium">{to.name}</div>
              {to.lines.map((line) => (
                <div key={line} className="text-text-muted">
                  {line}
                </div>
              ))}
              <div className="text-text-muted">{to.email}</div>
              {to.phone && <div className="text-text-muted">{to.phone}</div>}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-text-muted">Invoice date</div>
            <div className="mt-1.5 text-sm">{invoiceDate(order.created_at)}</div>
            <div className="mt-3 text-xs uppercase tracking-wide text-text-muted">Order</div>
            <div className="mt-1.5 text-sm">{order.order_number}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-text-muted">Payment</div>
            <div className="mt-1.5 text-sm">{paymentMethodLabel(order.payment_method)}</div>
            <div className="mt-1 text-sm capitalize text-text-muted">{order.payment_status}</div>
            {order.transaction_id && (
              <div className="mt-1 break-all font-mono text-[11px] text-text-muted">
                {order.transaction_id}
              </div>
            )}
          </div>
        </div>

        {/* Line items */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-3 font-semibold">Item</th>
              <th className="py-3 text-right font-semibold">Qty</th>
              <th className="py-3 text-right font-semibold">Unit price</th>
              <th className="py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, i) => (
              <tr key={i} className="border-b border-border align-top">
                <td className="py-3 pr-4">
                  <div className="font-medium">{it.title}</div>
                  {it.size && <div className="text-xs text-text-muted">Size {it.size}</div>}
                </td>
                <td className="py-3 text-right">{it.quantity}</td>
                <td className="py-3 text-right">{money(it.unit_price)}</td>
                <td className="py-3 text-right">{money(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-muted">Subtotal</dt>
              <dd>{money(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Shipping</dt>
              <dd>{order.shipping ? money(order.shipping) : 'Free'}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</dt>
                <dd>−{money(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd>
                {money(order.total)} {order.currency}
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-10 border-t border-border pt-5 text-xs text-text-muted">
          Thank you for your order. Questions about this invoice? Email {SELLER.email} and quote{' '}
          {order.order_number}.
        </p>
      </div>
    </div>
  )
}
