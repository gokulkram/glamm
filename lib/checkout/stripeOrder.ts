import type Stripe from 'stripe'
import { priceCart, type CartLineInput } from '@/lib/checkout/pricing'
import { createOrder } from '@/lib/orders'

/**
 * Build (or fetch, if it already exists) the order for a SUCCEEDED Stripe
 * PaymentIntent. Cart + customer travel in the PaymentIntent metadata so this
 * works from both the return page and the webhook. Idempotent on the PI id —
 * whichever fires first wins, the other returns the same order.
 */
export async function createOrderFromPaymentIntent(
  pi: Stripe.PaymentIntent,
): Promise<{ ok: true; orderNumber: string } | { ok: false; error: string }> {
  const m = (pi.metadata ?? {}) as Record<string, string>

  let cartInput: CartLineInput[]
  try {
    cartInput = (JSON.parse(m.cart || '[]') as { p: number; s: string; q: number }[]).map((x) => ({
      product_id: Number(x.p),
      size: x.s,
      quantity: Number(x.q),
    }))
  } catch {
    return { ok: false, error: 'Invalid cart data on payment' }
  }

  // Re-price from the database — never trust an amount carried on the client.
  const priced = await priceCart(cartInput)
  if ('error' in priced) return { ok: false, error: priced.error }

  const result = await createOrder({
    userId: m.userId || null,
    customer: {
      email: m.email || pi.receipt_email || '',
      phone: m.phone,
      firstName: m.firstName,
      lastName: m.lastName,
      address1: m.address1,
      address2: m.address2,
      city: m.city,
      state: m.state,
      zip: m.zip,
    },
    items: priced.cart.lineItems.map((l) => ({
      product_id: l.product_id,
      title: l.title,
      slug: l.slug,
      size: l.size,
      image: l.image,
      quantity: l.quantity,
      unit_price: l.unit_price,
    })),
    subtotal: priced.cart.subtotal,
    shipping: priced.cart.shipping,
    total: priced.cart.total,
    payment: { method: 'stripe', status: 'paid', transactionId: pi.id },
  })

  if (!result.ok) return { ok: false, error: result.error }
  return { ok: true, orderNumber: result.orderNumber }
}
