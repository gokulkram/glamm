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

/**
 * The wording above the homepage testimonial carousel. Editable from
 * Admin → Testimonials.
 *
 * The rating badge underneath it isn't in here: it is the average and the
 * count of the stars on the visible testimonials, so it can't be typed in.
 */
export type TestimonialsSection = {
  eyebrow: string
  heading: string
}

export const DEFAULT_TESTIMONIALS_SECTION: TestimonialsSection = {
  eyebrow: 'Real Reviews. Real Results.',
  heading: 'What Our Customers Say',
}

/**
 * The homepage hero — the first thing on the site. Editable from Admin →
 * Homepage.
 *
 * The two heading lines and the two subtitle lines are separate fields on
 * purpose: each pair is styled differently (the second heading line is filled
 * with a gradient, the second subtitle line is tinted), so they can't be one
 * block of text without losing that.
 *
 * The trust row's icons stay in code — only the numbers and captions under
 * them are editable.
 */
export type HeroStat = {
  /** The big number, e.g. "100%". */
  value: string
  /** The caption under it, e.g. "Premium Quality". */
  label: string
}

export type HeroContent = {
  badge: string
  headingTop: string
  headingBottom: string
  subtitle: string
  subtitleAccent: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
  /** Background image URL or path. */
  image: string
  /** Exactly three, matching the three icons the hero draws. */
  stats: [HeroStat, HeroStat, HeroStat]
  socialCount: string
  socialLabel: string
}

/** What the hero shipped with — also the per-field fallback for blank input. */
export const DEFAULT_HERO: HeroContent = {
  badge: '100% Virgin Human Hair',
  headingTop: 'Your Most Stunning',
  headingBottom: 'Look Starts Here',
  subtitle: 'Your Natural Beauty, Upgraded.',
  subtitleAccent: 'Luxurious • Natural • Effortlessly Stunning',
  primaryLabel: 'Shop Collection',
  primaryHref: '/shop',
  secondaryLabel: 'Discover More',
  secondaryHref: '/about',
  image: '/lucy-photos/_F8A0531-Edit.jpg',
  stats: [
    { value: '100%', label: 'Premium Quality' },
    { value: 'Free', label: 'Shipping' },
    { value: '30 Day', label: 'Guarantee' },
  ],
  socialCount: '5,000+',
  socialLabel: 'Happy Customers',
}
