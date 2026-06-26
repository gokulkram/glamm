import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { repositionProduct } from '@/lib/admin/reposition'

export const runtime = 'nodejs'

// Move a product one step up or down in the catalog order.
export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { id?: number; direction?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const id = Number(body.id)
  const { direction } = body
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
  }
  if (direction !== 'up' && direction !== 'down') {
    return NextResponse.json({ error: 'Invalid direction' }, { status: 400 })
  }

  const sb = supabaseAdmin()

  // Resolve the product's current position server-side (don't trust the client).
  const { data, error } = await sb
    .from('products')
    .select('id')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })
  if (error) {
    console.error('Reorder read failed:', error)
    return NextResponse.json({ error: 'Could not read catalog order' }, { status: 500 })
  }

  const ids = (data as { id: number }[]).map((r) => r.id)
  const idx = ids.indexOf(id)
  if (idx === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const targetIdx = direction === 'up' ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= ids.length) {
    // Already at the top/bottom — nothing to do.
    return NextResponse.json({ success: true, noop: true })
  }

  try {
    await repositionProduct(sb, id, targetIdx + 1) // repositionProduct takes a 1-based position
  } catch (e) {
    console.error('Reorder failed:', e)
    return NextResponse.json({ error: 'Could not reorder product' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
