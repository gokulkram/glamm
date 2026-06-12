import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Delete a category (only if no products use it)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid category id' }, { status: 400 })
  }

  const sb = supabaseAdmin()

  // Find the category so we can check product usage by name
  const { data: cat } = await sb.from('categories').select('name').eq('id', id).maybeSingle()
  if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 })

  const { count } = await sb
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category', cat.name)

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${count} product(s) still use "${cat.name}". Reassign them first.` },
      { status: 409 },
    )
  }

  const { error } = await sb.from('categories').delete().eq('id', id)
  if (error) {
    console.error('Delete category failed:', error)
    return NextResponse.json({ error: 'Could not delete category' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
