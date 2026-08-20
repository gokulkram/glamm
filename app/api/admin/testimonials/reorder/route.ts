import { createReorderHandler } from '@/lib/admin/reorderRoute'
import { TESTIMONIAL_ORDER } from '@/lib/admin/reposition'

export const runtime = 'nodejs'

// Move a testimonial in the homepage carousel. The homepage is cached
// (revalidate = 60), so the move is pushed out immediately.
export const POST = createReorderHandler({
  order: TESTIMONIAL_ORDER,
  noun: 'testimonial',
  sqlFile: 'supabase/testimonials.sql',
  revalidate: ['/'],
})
