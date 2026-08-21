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

// Rename a category.
//
// Products reference their category by name, not by id, so a rename has to
// carry across to every product using the old name or they'd all be orphaned —
// dropped from the category counts and from the shop's category filter.
//
// The slug is deliberately not editable: it's what /shop?category=… matches on,
// and the header and footer link to those slugs directly, so changing one would
// silently break navigation that only a code change could repair.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid category id' }, { status: 400 })
  }

  let body: { name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name) return NextResponse.json({ error: 'Category name is required' }, { status: 400 })

  const sb = supabaseAdmin()

  const { data: all, error: readErr } = await sb.from('categories').select('id, name')
  if (readErr) {
    console.error('Rename category failed to read categories:', readErr)
    return NextResponse.json({ error: 'Could not rename category' }, { status: 500 })
  }

  const cat = all?.find((c) => c.id === id)
  if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 })

  const oldName = cat.name
  if (oldName === name) return NextResponse.json({ success: true, moved: 0 })

  // Two categories sharing a name would make every product count ambiguous,
  // since counting is by name. Compared case-insensitively: "bulk hair" and
  // "Bulk Hair" would read as duplicates to anyone looking at the list.
  const clash = all?.some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase())
  if (clash) {
    return NextResponse.json({ error: `A category called "${name}" already exists` }, { status: 409 })
  }

  const { error: renameErr } = await sb.from('categories').update({ name }).eq('id', id)
  if (renameErr) {
    console.error('Rename category failed:', renameErr)
    return NextResponse.json({ error: 'Could not rename category' }, { status: 500 })
  }

  // Both statements are individually atomic, but there's no transaction across
  // them — so if the cascade fails, put the name back rather than leave the
  // products pointing at a category that no longer exists under that name.
  const { data: moved, error: cascadeErr } = await sb
    .from('products')
    .update({ category: name })
    .eq('category', oldName)
    .select('id')

  if (cascadeErr) {
    console.error('Category rename cascade failed, reverting:', cascadeErr)
    const { error: revertErr } = await sb.from('categories').update({ name: oldName }).eq('id', id)
    if (revertErr) {
      console.error('Could not revert category rename:', revertErr)
      return NextResponse.json(
        { error: `Renamed the category but could not move its products, and could not undo it. Set the name back to "${oldName}" manually.` },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: 'Could not move the products into the renamed category — nothing was changed' }, { status: 500 })
  }

  return NextResponse.json({ success: true, moved: moved?.length ?? 0 })
}
