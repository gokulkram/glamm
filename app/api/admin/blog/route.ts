import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { buildBlogRow, type BlogInput } from '@/lib/admin/blogPayload'

export const runtime = 'nodejs'

// Create a blog post
export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
  const { data, error: insertError } = await sb
    .from('blog_posts')
    .insert(row)
    .select('id, slug')
    .single()

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'A post with that slug already exists' }, { status: 409 })
    }
    console.error('Create blog post failed:', insertError)
    return NextResponse.json({ error: 'Could not create post' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id, slug: data.slug })
}
