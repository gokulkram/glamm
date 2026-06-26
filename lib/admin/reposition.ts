import type { supabaseAdmin } from '@/lib/supabase/admin'

type Sb = ReturnType<typeof supabaseAdmin>

/**
 * Move product `id` to a 1-based `position` in the global catalog order
 * (the order shared by the admin list and the storefront), renumbering every
 * product to a contiguous 1..N `sort_order`.
 *
 * Only rows whose `sort_order` actually changes are written, so saving a
 * product without moving it costs zero updates. `sort_order` is not unique, so
 * there is no risk of a transient collision while the loop runs; a mid-loop
 * failure simply leaves a partial renumber that the next save heals (it always
 * renumbers from scratch).
 */
export async function repositionProduct(sb: Sb, id: number, position: number): Promise<void> {
  const { data, error } = await sb
    .from('products')
    .select('id, sort_order')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })
  if (error) throw error

  const rows = (data as { id: number; sort_order: number }[]) ?? []
  const oldOrder = new Map(rows.map((r) => [r.id, r.sort_order]))

  // Pull the target out, then re-insert it at the desired (clamped) slot.
  const ids = rows.map((r) => r.id).filter((x) => x !== id)
  const clamped = Math.min(Math.max(1, Math.floor(position)), ids.length + 1)
  ids.splice(clamped - 1, 0, id)

  // Assign contiguous 1..N; write only the rows that moved.
  for (let i = 0; i < ids.length; i++) {
    const pid = ids[i]
    const newOrder = i + 1
    if (oldOrder.get(pid) === newOrder) continue
    const { error: upErr } = await sb.from('products').update({ sort_order: newOrder }).eq('id', pid)
    if (upErr) throw upErr
  }
}
