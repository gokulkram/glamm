import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Create a category
export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { name?: string; slug?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name) return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
  const slug = (body.slug?.trim() && slugify(body.slug)) || slugify(name)
  if (!slug) return NextResponse.json({ error: 'Could not derive a valid slug' }, { status: 400 })

  const sb = supabaseAdmin()
  const { data: maxRow } = await sb
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const sortOrder = (maxRow?.sort_order ?? -1) + 1

  const { data, error } = await sb
    .from('categories')
    .insert({ name, slug, sort_order: sortOrder })
    .select('id, name, slug')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A category with that slug already exists' }, { status: 409 })
    }
    console.error('Create category failed:', error)
    return NextResponse.json({ error: 'Could not create category' }, { status: 500 })
  }

  return NextResponse.json({ success: true, category: data })
}
