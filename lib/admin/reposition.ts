import type { supabaseAdmin } from '@/lib/supabase/admin'

type Sb = ReturnType<typeof supabaseAdmin>

/**
 * A table whose rows the admin hand-orders through a `sort_order` column.
 *
 * `tiebreak` is what keeps the admin list and the server agreeing: the client
 * derives positions from its own row order, so any read that can come back in
 * two different orders would make a drop land somewhere the user didn't aim.
 * Every column chain here has to end in something unique.
 */
export type OrderedTable = {
  table: string
  /** SQL function that renumbers in one statement (supabase/reorder-*.sql). */
  rpc: string
  /** Columns applied after `sort_order`, in order. */
  tiebreak: { column: string; ascending: boolean }[]
}

export const PRODUCT_ORDER: OrderedTable = {
  table: 'products',
  rpc: 'reorder_products',
  tiebreak: [{ column: 'id', ascending: true }],
}

/** Rows still at the 0 default fall back to newest-first, as they did before. */
export const REVIEW_ORDER: OrderedTable = {
  table: 'reviews',
  rpc: 'reorder_reviews',
  tiebreak: [
    { column: 'created_at', ascending: false },
    { column: 'id', ascending: false },
  ],
}

/**
 * Seeded in one statement, so `created_at` is identical across rows — `id`
 * ascending is the only tiebreak that preserves the seeded order.
 */
export const TESTIMONIAL_ORDER: OrderedTable = {
  table: 'testimonials',
  rpc: 'reorder_testimonials',
  tiebreak: [{ column: 'id', ascending: true }],
}

/** Read a table in its current display order. */
async function readOrder(sb: Sb, t: OrderedTable): Promise<{ id: number; sort_order: number }[]> {
  let query = sb.from(t.table).select('id, sort_order').order('sort_order', { ascending: true })
  for (const tb of t.tiebreak) query = query.order(tb.column, { ascending: tb.ascending })
  const { data, error } = await query
  if (error) throw error
  return (data as { id: number; sort_order: number }[]) ?? []
}

/** Just the ids, in display order — for resolving "one step up/down" server-side. */
export async function readOrderedIds(sb: Sb, t: OrderedTable): Promise<number[]> {
  return (await readOrder(sb, t)).map((r) => r.id)
}

/**
 * Write `ids` back as a contiguous 1..N `sort_order`.
 *
 * Prefers the table's SQL function (one atomic statement), because a drag can
 * move a row across the whole list and renumber everything in between. Falls
 * back to per-row updates when that function hasn't been installed yet,
 * writing only the rows whose position actually changed.
 */
async function writeOrder(sb: Sb, t: OrderedTable, ids: number[], oldOrder: Map<number, number>): Promise<void> {
  const { error } = await sb.rpc(t.rpc, { p_ids: ids })
  if (!error) return

  // PGRST202 = function not found in the schema cache; 42883 = undefined_function.
  const missing = error.code === 'PGRST202' || error.code === '42883'
  if (!missing) throw error

  for (let i = 0; i < ids.length; i++) {
    const rowId = ids[i]
    const newOrder = i + 1
    if (oldOrder.get(rowId) === newOrder) continue
    const { error: upErr } = await sb.from(t.table).update({ sort_order: newOrder }).eq('id', rowId)
    if (upErr) throw upErr
  }
}

/**
 * Move row `id` to a 1-based `position`, renumbering every row to a contiguous
 * 1..N `sort_order`.
 *
 * `sort_order` is not unique, so there is no risk of a transient collision
 * while renumbering; a partial write simply leaves an order that the next save
 * heals (it always renumbers from scratch).
 */
export async function repositionRow(sb: Sb, t: OrderedTable, id: number, position: number): Promise<void> {
  const rows = await readOrder(sb, t)
  const oldOrder = new Map(rows.map((r) => [r.id, r.sort_order]))

  // Pull the target out, then re-insert it at the desired (clamped) slot.
  const ids = rows.map((r) => r.id).filter((x) => x !== id)
  const clamped = Math.min(Math.max(1, Math.floor(position)), ids.length + 1)
  ids.splice(clamped - 1, 0, id)

  await writeOrder(sb, t, ids, oldOrder)
}

/**
 * Move row `id` so that it sits immediately before/after `targetId`.
 *
 * Used by drag-and-drop. Positions are resolved here from the live table
 * rather than taken from the client, so a stale admin list (someone else
 * reordered, a row was added or deleted) still produces the drop the user
 * saw: "put this row where that row is".
 *
 * Returns false if either row no longer exists.
 */
export async function placeRowRelativeTo(
  sb: Sb,
  t: OrderedTable,
  id: number,
  targetId: number,
  placement: 'before' | 'after',
): Promise<boolean> {
  const rows = await readOrder(sb, t)
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

  await writeOrder(sb, t, ids, oldOrder)
  return true
}

/**
 * Move product `id` to a 1-based `position` in the global catalog order (the
 * order shared by the admin list and the storefront).
 */
export function repositionProduct(sb: Sb, id: number, position: number): Promise<void> {
  return repositionRow(sb, PRODUCT_ORDER, id, position)
}

/** Move product `id` so that it sits immediately before/after `targetId`. */
export function placeProductRelativeTo(
  sb: Sb,
  id: number,
  targetId: number,
  placement: 'before' | 'after',
): Promise<boolean> {
  return placeRowRelativeTo(sb, PRODUCT_ORDER, id, targetId, placement)
}
