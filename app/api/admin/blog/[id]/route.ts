import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { buildBlogRow, type BlogInput } from '@/lib/admin/blogPayload'

export const runtime = 'nodejs'

// Update a blog post
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
  }

  let input: BlogInput
  try {
    input = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { row, error } = buildBlogRow(input)
  if (error || !row) return NextResponse.json({ error: error ?? 'Invalid post' }, { status: 400 })

  const sb = supabaseAdmin()
  const { data, error: updateError } = await sb
    .from('blog_posts')
    .update(row)
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (updateError) {
    if (updateError.code === '23505') {
      return NextResponse.json({ error: 'A post with that slug already exists' }, { status: 409 })
    }
    console.error('Update blog post failed:', updateError)
    return NextResponse.json({ error: 'Could not update post' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, id: data.id })
}

// Delete a blog post
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
  }

  const sb = supabaseAdmin()
  const { error } = await sb.from('blog_posts').delete().eq('id', id)
  if (error) {
    console.error('Delete blog post failed:', error)
    return NextResponse.json({ error: 'Could not delete post' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
