import type { supabaseAdmin } from '@/lib/supabase/admin'

type Sb = ReturnType<typeof supabaseAdmin>

/** Read the catalog in its current order. */
async function readOrder(sb: Sb): Promise<{ id: number; sort_order: number }[]> {
  const { data, error } = await sb
    .from('products')
    .select('id, sort_order')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })
  if (error) throw error
  return (data as { id: number; sort_order: number }[]) ?? []
}

/**
 * Write `ids` back as a contiguous 1..N `sort_order`.
 *
 * Prefers the `reorder_products` SQL function (one atomic statement — see
 * supabase/reorder-products.sql), because a drag can move a product across the
 * whole catalog and renumber everything in between. Falls back to per-row
 * updates when that function hasn't been installed yet, writing only the rows
 * whose position actually changed.
 */
async function writeOrder(sb: Sb, ids: number[], oldOrder: Map<number, number>): Promise<void> {
  const { error } = await sb.rpc('reorder_products', { p_ids: ids })
  if (!error) return

  // PGRST202 = function not found in the schema cache; 42883 = undefined_function.
  const missing = error.code === 'PGRST202' || error.code === '42883'
  if (!missing) throw error

  for (let i = 0; i < ids.length; i++) {
    const pid = ids[i]
    const newOrder = i + 1
    if (oldOrder.get(pid) === newOrder) continue
    const { error: upErr } = await sb.from('products').update({ sort_order: newOrder }).eq('id', pid)
    if (upErr) throw upErr
  }
}

/**
 * Move product `id` to a 1-based `position` in the global catalog order
 * (the order shared by the admin list and the storefront), renumbering every
 * product to a contiguous 1..N `sort_order`.
 *
 * `sort_order` is not unique, so there is no risk of a transient collision
 * while renumbering; a partial write simply leaves an order that the next save
 * heals (it always renumbers from scratch).
 */
export async function repositionProduct(sb: Sb, id: number, position: number): Promise<void> {
  const rows = await readOrder(sb)
  const oldOrder = new Map(rows.map((r) => [r.id, r.sort_order]))

  // Pull the target out, then re-insert it at the desired (clamped) slot.
  const ids = rows.map((r) => r.id).filter((x) => x !== id)
  const clamped = Math.min(Math.max(1, Math.floor(position)), ids.length + 1)
  ids.splice(clamped - 1, 0, id)

  await writeOrder(sb, ids, oldOrder)
}

/**
 * Move product `id` so that it sits immediately before/after `targetId`.
 *
 * Used by drag-and-drop. Positions are resolved here from the live catalog
 * rather than taken from the client, so a stale admin list (someone else
 * reordered, a product was added or deleted) still produces the drop the user
 * saw: "put this row where that row is".
 *
 * Returns false if either product no longer exists.
 */
export async function placeProductRelativeTo(
  sb: Sb,
  id: number,
  targetId: number,
  placement: 'before' | 'after',
): Promise<boolean> {
  const rows = await readOrder(sb)
  const oldOrder = new Map(rows.map((r) => [r.id, r.sort_order]))
  const allIds = rows.map((r) => r.id)

  if (!allIds.includes(id) || !allIds.includes(targetId)) return false
  if (id === targetId) return true

  // Remove the dragged row first, then find the target in what's left — this is
  // what makes dragging up and dragging down agree. When moving down, pulling
  // the row out shifts the target one slot toward the front, and splicing at
  // the target's *post-removal* index lands the row exactly where it was dropped.
  const ids = allIds.filter((x) => x !== id)
  const targetIdx = ids.indexOf(targetId)
  ids.splice(placement === 'before' ? targetIdx : targetIdx + 1, 0, id)

  await writeOrder(sb, ids, oldOrder)
  return true
}
