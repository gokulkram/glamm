import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { placeProductRelativeTo, repositionProduct } from '@/lib/admin/reposition'

export const runtime = 'nodejs'

/**
 * Move a product in the catalog order. Three ways to say where:
 *   { id, direction: 'up' | 'down' }              — the ▲/▼ buttons
 *   { id, targetId, placement: 'before'|'after' } — drag & drop
 *   { id, position: 1-based }                     — the "move to #" input
 *
 * Note this order is shared with the storefront, so every move is live on the
 * public catalog immediately.
 */
export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { id?: number; direction?: string; targetId?: number; placement?: string; position?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const id = Number(body.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
  }

  const sb = supabaseAdmin()

  // ---- Drag & drop: place relative to a neighbour row ----
  if (body.targetId !== undefined || body.placement !== undefined) {
    const targetId = Number(body.targetId)
    const { placement } = body
    if (!Number.isInteger(targetId)) {
      return NextResponse.json({ error: 'Invalid target product id' }, { status: 400 })
    }
    if (placement !== 'before' && placement !== 'after') {
      return NextResponse.json({ error: 'Invalid placement' }, { status: 400 })
    }
    try {
      const ok = await placeProductRelativeTo(sb, id, targetId, placement)
      if (!ok) {
        return NextResponse.json(
          { error: 'That product is no longer in the catalog — reload the page' },
          { status: 409 },
        )
      }
    } catch (e) {
      console.error('Reorder failed:', e)
      return NextResponse.json({ error: 'Could not reorder product' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  // ---- Move to an explicit position ----
  if (body.position !== undefined) {
    const position = Number(body.position)
    if (!Number.isInteger(position) || position < 1) {
      return NextResponse.json({ error: 'Invalid position' }, { status: 400 })
    }
    try {
      await repositionProduct(sb, id, position)
    } catch (e) {
      console.error('Reorder failed:', e)
      return NextResponse.json({ error: 'Could not reorder product' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  // ---- Nudge one step up or down ----
  const { direction } = body
  if (direction !== 'up' && direction !== 'down') {
    return NextResponse.json({ error: 'Invalid direction' }, { status: 400 })
  }

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
