import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { parseFaqInput } from '@/lib/faq'

export const runtime = 'nodejs'

/**
 * Edit a question, or just toggle whether it shows.
 *
 * A body carrying only `is_active` is the show/hide switch in the admin list;
 * anything else is a full edit and has to pass the same validation as a new
 * question.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid question id' }, { status: 400 })
  }

  let body: { question?: string; answer?: string; category?: string; is_active?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const onlyToggling =
    typeof body.is_active === 'boolean' &&
    body.question === undefined &&
    body.answer === undefined &&
    body.category === undefined

  let patch: Record<string, unknown>
  if (onlyToggling) {
    patch = { is_active: body.is_active }
  } else {
    const parsed = parseFaqInput(body)
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
    patch = { ...parsed }
    if (typeof body.is_active === 'boolean') patch.is_active = body.is_active
  }

  const sb = supabaseAdmin()
  const { data, error } = await sb.from('faqs').update(patch).eq('id', id).select('id')

  if (error) {
    console.error('Update FAQ failed:', error)
    return NextResponse.json({ error: 'Could not save the question' }, { status: 500 })
  }
  if (!data?.length) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  revalidatePath('/faq')
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid question id' }, { status: 400 })
  }

  const sb = supabaseAdmin()
  const { data, error } = await sb.from('faqs').delete().eq('id', id).select('id')
  if (error) {
    console.error('Delete FAQ failed:', error)
    return NextResponse.json({ error: 'Could not delete the question' }, { status: 500 })
  }
  if (!data?.length) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  revalidatePath('/faq')
  return NextResponse.json({ success: true })
}
