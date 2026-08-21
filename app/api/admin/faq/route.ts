import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isMissingFaqTable, parseFaqInput } from '@/lib/faq'

export const runtime = 'nodejs'

/** Create a question. New ones go to the end of the list. */
export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { question?: string; answer?: string; category?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = parseFaqInput(body)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const sb = supabaseAdmin()
  const { data: maxRow } = await sb
    .from('faqs')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await sb
    .from('faqs')
    .insert({ ...parsed, sort_order: (maxRow?.sort_order ?? 0) + 1 })

  if (error) {
    if (isMissingFaqTable(error)) {
      return NextResponse.json(
        { error: 'Run supabase/faq.sql in Supabase first — the faqs table does not exist yet.' },
        { status: 409 },
      )
    }
    console.error('Create FAQ failed:', error)
    return NextResponse.json({ error: 'Could not add the question' }, { status: 500 })
  }

  revalidatePath('/faq')
  return NextResponse.json({ success: true })
}
