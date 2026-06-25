/**
 * Site-wide product content (Hair Care + Shipping & Returns) shown on every
 * product page. Client-safe: no server imports, so it can be used in both the
 * server settings layer and client components.
 *
 * Body text uses markdown-lite: "## Heading", "- bullet", blank-line paragraphs.
 */
export type ProductContent = {
  care: string
  shipping: string
}

export const DEFAULT_PRODUCT_CONTENT: ProductContent = {
  care: `Proper care ensures your hair extensions maintain their beautiful texture and last longer. Follow these professional tips:

## Washing
- Use sulfate-free shampoo and conditioner
- Wash in lukewarm water, not hot
- Gently massage, don't rub vigorously
- Rinse thoroughly to remove all product

## Styling
- Detangle with a wide-tooth comb when wet
- Air dry or use low heat settings
- Apply heat protectant before styling
- Avoid excessive heat to prolong lifespan

## Maintenance
- Apply leave-in conditioner regularly
- Deep condition weekly for best results
- Brush gently from ends to roots
- Use a silk pillowcase to reduce tangling

## Storage
- Store in a cool, dry place when not in use
- Keep in original packaging or a silk bag
- Avoid direct sunlight exposure
- Ensure completely dry before storing`,
  shipping: `We offer fast, reliable shipping to ensure your hair extensions arrive in perfect condition.

## Shipping
- FREE standard shipping on orders over $100
- $8.99 standard shipping on orders under $100
- Delivery: 3-5 business days
- Orders are processed within 24 hours; you'll receive a tracking number by email once it ships

## Returns & Exchanges
We want you to love your purchase! If you're not completely satisfied, we offer a hassle-free 30-day return policy.

- Products must be unused and in original packaging
- Return shipping is free for defective items
- Refunds are processed within 5-7 business days
- Exchanges available for different sizes or styles

To start a return or exchange, contact support@glammhair.com.`,
}

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }

/** Parse markdown-lite body text into renderable blocks. */
export function parseContentBlocks(raw: string): ContentBlock[] {
  const blocks: ContentBlock[] = []
  const lines = (raw || '').replace(/\r\n/g, '\n').split('\n')

  let para: string[] = []
  let list: string[] = []
  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'paragraph', text: para.join(' ').trim() })
      para = []
    }
  }
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: 'list', items: list.slice() })
      list = []
    }
  }

  for (const line of lines) {
    const t = line.trim()
    if (!t) {
      flushPara()
      flushList()
      continue
    }
    if (t.startsWith('## ')) {
      flushPara()
      flushList()
      blocks.push({ type: 'heading', text: t.slice(3).trim() })
      continue
    }
    if (t.startsWith('- ')) {
      flushPara()
      list.push(t.slice(2).trim())
      continue
    }
    flushList()
    para.push(t)
  }
  flushPara()
  flushList()
  return blocks
}
