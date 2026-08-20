import { createReorderHandler } from '@/lib/admin/reorderRoute'
import { REVIEW_ORDER } from '@/lib/admin/reposition'

export const runtime = 'nodejs'

/**
 * Move a review in the moderation list. The order is one global ranking shared
 * with the storefront, so moving a review also moves it on its product page as
 * soon as it's approved. Product pages are dynamic, so no revalidation needed.
 */
export const POST = createReorderHandler({
  order: REVIEW_ORDER,
  noun: 'review',
  sqlFile: 'supabase/reorder-reviews.sql',
})
