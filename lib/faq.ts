import { supabaseAdmin } from '@/lib/supabase/admin'
import { withAuthRetry } from '@/lib/supabase/retry'

/** The tabs on /faq. Fixed in code because each one carries an icon. */
export const FAQ_CATEGORIES = ['products', 'shipping', 'care', 'returns'] as const
export type FaqCategory = (typeof FAQ_CATEGORIES)[number]

export type Faq = {
  id: number
  question: string
  answer: string
  category: FaqCategory
  is_active: boolean
  sort_order: number
}

/**
 * The questions /faq shipped with. Used verbatim while supabase/faq.sql hasn't
 * been run — an empty help centre would look broken — and they are also its
 * seed rows.
 *
 * Ids are negative: these rows aren't in the database.
 */
export const DEFAULT_FAQS: Faq[] = [
  { id: -1, question: "What type of hair do you use for your extensions?", answer: "We use 100% virgin human hair sourced ethically from trusted suppliers. Our hair has never been chemically processed, dyed, or treated, ensuring the highest quality and most natural look. Each bundle is carefully inspected to meet our rigorous standards.", category: 'products', is_active: true, sort_order: 1 },
  { id: -2, question: "How long do the extensions last?", answer: "With proper care, our extensions can last 6-12 months or even longer. The lifespan depends on how well you maintain them, how often you wear them, and your styling habits. We provide detailed care instructions with every purchase to help you maximize their longevity.", category: 'products', is_active: true, sort_order: 2 },
  { id: -3, question: "Can I dye or color the extensions?", answer: "Yes! Since our extensions are made from 100% virgin human hair, you can dye, bleach, or color them just like your natural hair. However, we recommend having this done by a professional stylist to ensure the best results and to avoid damage.", category: 'products', is_active: true, sort_order: 3 },
  { id: -4, question: "What's the difference between the different curl patterns?", answer: "Each curl pattern offers a unique look: Body Wave has loose, flowing S-shaped waves; Deep Wave features more defined, glamorous waves; Indian Curl has tight, bouncy ringlets; Italian Curly offers medium curls with a silky finish; and Burmese Curl provides beautiful defined curls with volume.", category: 'products', is_active: true, sort_order: 4 },
  { id: -5, question: "How do I choose the right length?", answer: "Consider your desired final look and your natural hair length. For reference: 12-14\" reaches shoulder length, 16-18\" reaches mid-back, 20-22\" reaches lower back, and 24\"+ reaches waist length. We recommend ordering 2-3 bundles for a full, natural look.", category: 'products', is_active: true, sort_order: 5 },
  { id: -6, question: "Are the extensions suitable for all hair types?", answer: "Yes! Our extensions work beautifully with all hair types and textures. We offer various textures (straight, wavy, curly) to match your natural hair or create your desired look. Our customer service team can help you choose the best match for your hair.", category: 'products', is_active: true, sort_order: 6 },
  { id: -7, question: "What are closures and frontals used for?", answer: "Closures (4x4, 2x6) and frontals (13x4) are lace pieces that create a natural-looking scalp and hairline. They're installed at the crown or front of your head to complete your sew-in or wig, allowing for versatile parting and a seamless, undetectable finish.", category: 'products', is_active: true, sort_order: 7 },
  { id: -8, question: "How many bundles do I need?", answer: "For lengths 10-18\", we recommend 2-3 bundles. For 20-24\", use 3-4 bundles. For 26\"+ or very full looks, consider 4-5 bundles. Add a closure or frontal for complete coverage. Your stylist can provide personalized recommendations based on your desired style.", category: 'products', is_active: true, sort_order: 8 },
  { id: -9, question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days within the US. Express shipping (1-2 business days) is available at checkout. International shipping times vary by location (7-14 business days). You'll receive a tracking number once your order ships.", category: 'shipping', is_active: true, sort_order: 9 },
  { id: -10, question: "Do you offer free shipping?", answer: "Yes! We offer free standard shipping on all orders over ${{freeThreshold}} within the United States. For orders under ${{freeThreshold}}, standard shipping is ${{standardRate}}. Express shipping is available for an additional fee.", category: 'shipping', is_active: true, sort_order: 10 },
  { id: -11, question: "Can I track my order?", answer: "Absolutely! Once your order ships, you'll receive an email with a tracking number. You can use this to track your package in real-time. You can also log into your account on our website to view your order status and tracking information.", category: 'shipping', is_active: true, sort_order: 11 },
  { id: -12, question: "Do you ship internationally?", answer: "Yes, we ship to most countries worldwide! International shipping costs and delivery times vary by location. Customs fees and import duties may apply and are the responsibility of the customer. Contact us for specific shipping information for your country.", category: 'shipping', is_active: true, sort_order: 12 },
  { id: -13, question: "What if my package is lost or damaged?", answer: "If your package is lost in transit or arrives damaged, please contact us immediately at support@glammhair.com with your order number and photos (if damaged). We'll work with the carrier to resolve the issue and ensure you receive your extensions.", category: 'shipping', is_active: true, sort_order: 13 },
  { id: -14, question: "Can I change my shipping address after ordering?", answer: "If your order hasn't shipped yet, we can update your address. Please contact us as soon as possible at support@glammhair.com with your order number and new address. Once shipped, we cannot modify the delivery address.", category: 'shipping', is_active: true, sort_order: 14 },
  { id: -15, question: "How do I wash my extensions?", answer: "Wash your extensions every 10-15 wears or when product buildup occurs. Use sulfate-free shampoo and conditioner, wash in lukewarm water in a downward motion, and avoid rubbing or twisting. Gently squeeze out excess water and air dry on a towel or wig stand.", category: 'care', is_active: true, sort_order: 15 },
  { id: -16, question: "Can I use heat styling tools?", answer: "Yes! Our virgin human hair can be heat styled just like your natural hair. Always use a heat protectant spray and keep temperatures below 350°F (180°C) to prevent damage. Lower heat settings are better for longevity.", category: 'care', is_active: true, sort_order: 16 },
  { id: -17, question: "How should I store my extensions?", answer: "Store extensions in a cool, dry place away from direct sunlight. For clip-ins, hang them or lay flat in their original packaging. For bundles, store in a silk or satin bag. Ensure they're completely dry before storing to prevent mildew.", category: 'care', is_active: true, sort_order: 17 },
  { id: -18, question: "What products should I use?", answer: "Use sulfate-free, alcohol-free products designed for color-treated or natural hair. Avoid heavy oils and silicones that cause buildup. We recommend leave-in conditioners, heat protectants, and light serums for shine. Avoid products with harsh chemicals.", category: 'care', is_active: true, sort_order: 18 },
  { id: -19, question: "How do I prevent tangling?", answer: "Brush extensions daily with a wide-tooth comb or loop brush, starting from the ends and working up. Sleep with hair in a loose braid or ponytail on a silk pillowcase. Avoid excessive product buildup and wash regularly to maintain smoothness.", category: 'care', is_active: true, sort_order: 19 },
  { id: -20, question: "Can I swim with my extensions?", answer: "While possible, we recommend avoiding chlorine and salt water as they can dry out and damage the hair. If you must swim, wet the hair first with clean water, apply leave-in conditioner, and braid it. Wash thoroughly with clarifying shampoo afterward.", category: 'care', is_active: true, sort_order: 20 },
  { id: -21, question: "What is your return policy?", answer: "We offer a 30-day satisfaction guarantee. If you're not completely satisfied, you can return unopened, unused bundles in their original packaging for a full refund. Hair must be in resalable condition with all tags attached.", category: 'returns', is_active: true, sort_order: 21 },
  { id: -22, question: "How do I initiate a return?", answer: "Contact our customer service team at support@glammhair.com with your order number and reason for return. We'll provide a return authorization number and instructions. Once we receive and inspect the return, we'll process your refund within 5-7 business days.", category: 'returns', is_active: true, sort_order: 22 },
  { id: -23, question: "Are there any items that cannot be returned?", answer: "For hygiene reasons, we cannot accept returns on opened bundles, closures, or frontals. Custom-colored or specially ordered items are also non-returnable. All sale and clearance items are final sale.", category: 'returns', is_active: true, sort_order: 23 },
  { id: -24, question: "Do you offer exchanges?", answer: "Yes! If you need a different length, texture, or quantity, we're happy to exchange unopened items within 30 days. Contact us to arrange an exchange. You'll receive a prepaid return label, and we'll ship your new items once we receive the return.", category: 'returns', is_active: true, sort_order: 24 },
]

/**
 * Answers may contain {{freeThreshold}} and {{standardRate}}. They are filled
 * in at render time from the admin shipping settings.
 *
 * This replaces matching one answer by its exact question text, which broke
 * silently the moment that question was reworded — and now that questions are
 * editable, that would have been a matter of time.
 */
export function fillShippingTokens(
  answer: string,
  rates: { freeThreshold: number | string; standardRate: number | string },
): string {
  return answer
    .replace(/\{\{\s*freeThreshold\s*\}\}/g, String(rates.freeThreshold))
    .replace(/\{\{\s*standardRate\s*\}\}/g, String(rates.standardRate))
}

const COLUMNS = 'id, question, answer, category, is_active, sort_order'

// Postgres undefined_table / PostgREST "not in the schema cache" — i.e.
// supabase/faq.sql hasn't been run yet.
const MISSING_TABLE_CODES = ['42P01', 'PGRST205']

export const isMissingFaqTable = (e: { code?: string } | null) =>
  Boolean(e?.code && MISSING_TABLE_CODES.includes(e.code))

/**
 * Read FAQs in the admin's order. The `id` tiebreak has to match FAQ_ORDER in
 * lib/admin/reposition.ts — drag-to-reorder derives positions from this order,
 * so a read that could come back two ways would make a drop land somewhere the
 * admin didn't aim.
 */
async function readFaqs(activeOnly: boolean): Promise<Faq[]> {
  const sb = supabaseAdmin()
  let q = sb.from('faqs').select(COLUMNS)
  if (activeOnly) q = q.eq('is_active', true)
  const { data, error } = await q
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })
  if (error) throw error
  return (data as unknown as Faq[]) ?? []
}

/** Active questions for /faq. */
export async function getFaqs(): Promise<Faq[]> {
  try {
    return await withAuthRetry('getFaqs', () => readFaqs(true))
  } catch (e) {
    // Logged so a broken connection doesn't look like "the SQL isn't run yet" —
    // both end up showing the shipped questions.
    console.error('getFaqs failed, falling back to the shipped questions:', e)
    return DEFAULT_FAQS
  }
}

/** Every question, hidden ones included (admin list). */
export async function getAllFaqs(): Promise<Faq[]> {
  try {
    return await withAuthRetry('getAllFaqs', () => readFaqs(false))
  } catch (e) {
    if (isMissingFaqTable(e as { code?: string } | null)) return DEFAULT_FAQS
    console.error('getAllFaqs failed:', e)
    return []
  }
}

const MAX_QUESTION = 300
const MAX_ANSWER = 4000

/** Validate and normalise an admin question payload. Shared by create + edit. */
export function parseFaqInput(body: {
  question?: string
  answer?: string
  category?: string
}): { question: string; answer: string; category: FaqCategory } | { error: string } {
  const question = (body.question ?? '').trim().slice(0, MAX_QUESTION)
  const answer = (body.answer ?? '').trim().slice(0, MAX_ANSWER)
  if (!question) return { error: 'A question is required' }
  if (!answer) return { error: 'An answer is required' }
  const category = (body.category ?? 'products') as FaqCategory
  if (!FAQ_CATEGORIES.includes(category)) {
    return { error: `Unknown category "${body.category}"` }
  }
  return { question, answer, category }
}
