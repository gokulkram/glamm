import { getProducts } from '@/lib/products'
import { computeShipping } from '@/lib/checkout/shipping'
import { getShippingConfig } from '@/lib/settings'

/** What the browser sends — only identifiers, never trusted prices. */
export type CartLineInput = {
  product_id: number
  size?: string
  quantity: number
}

export type PricedLine = {
  product_id: number
  title: string
  slug: string
  size: string
  image: string
  quantity: number
  unit_price: number
  line_total: number
}

export type PricedCart = {
  lineItems: PricedLine[]
  subtotal: number
  shipping: number
  total: number
}

/**
 * Recompute the cart total from authoritative database prices. The browser is
 * only trusted for product id / size / quantity — never the price or total.
 * Returns `{ error }` for an empty cart, unknown product, bad size/quantity,
 * or out-of-stock item.
 */
export async function priceCart(
  items: CartLineInput[],
): Promise<{ cart: PricedCart } | { error: string }> {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: 'Your cart is empty' }
  }

  const products = await getProducts()
  const byId = new Map(products.map((p) => [p.id, p]))

  const lineItems: PricedLine[] = []
  for (const it of items) {
    const quantity = Math.floor(Number(it.quantity))
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { error: 'Invalid quantity in cart' }
    }

    const product = byId.get(Number(it.product_id))
    if (!product) {
      return { error: 'One of the items is no longer available' }
    }
    if (!product.inStock) {
      return { error: `${product.title} is out of stock` }
    }

    const size = String(it.size ?? '')
    if (product.sizes.length > 0 && !product.sizes.includes(size)) {
      return { error: `Please choose a valid size for ${product.title}` }
    }

    const unitPrice = Number(product.sizes_prices?.[size] ?? product.priceMin)
    if (!unitPrice || unitPrice <= 0) {
      return { error: `Pricing unavailable for ${product.title}` }
    }

    lineItems.push({
      product_id: product.id,
      title: product.title,
      slug: product.slug,
      size,
      image: product.image,
      quantity,
      unit_price: unitPrice,
      line_total: Number((unitPrice * quantity).toFixed(2)),
    })
  }

  const subtotal = Number(lineItems.reduce((s, l) => s + l.line_total, 0).toFixed(2))
  const shipping = computeShipping(subtotal, await getShippingConfig())
  const total = Number((subtotal + shipping).toFixed(2))

  return { cart: { lineItems, subtotal, shipping, total } }
}
