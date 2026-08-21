import { createReorderHandler } from '@/lib/admin/reorderRoute'
import { FAQ_ORDER } from '@/lib/admin/reposition'

export const runtime = 'nodejs'

// Move a question on the FAQ page.
export const POST = createReorderHandler({
  order: FAQ_ORDER,
  noun: 'question',
  sqlFile: 'supabase/faq.sql',
  revalidate: ['/faq'],
})
