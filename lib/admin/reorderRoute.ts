import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { placeRowRelativeTo, readOrderedIds, repositionRow, type OrderedTable } from '@/lib/admin/reposition'

// Postgres: column does not exist — i.e. the table's SQL file hasn't been run.
const UNDEFINED_COLUMN = '42703'

type Options = {
  /** Which table this route reorders. */
  order: OrderedTable
  /** Singular noun for error messages, e.g. 'review'. */
  noun: string
  /** SQL file to point at when `sort_order` is missing. */
  sqlFile: string
  /** Cached storefront paths to refresh after a successful move. */
  revalidate?: string[]
}

/**
 * The POST handler behind every admin reorder route. Three ways to say where a
 * row goes:
 *   { id, direction: 'up' | 'down' }              — the ▲/▼ buttons
 *   { id, targetId, placement: 'before'|'after' } — drag & drop
 *   { id, position: 1-based }                     — the "move to #" input
 *
 * Positions are always resolved server-side from the live table, so a stale
 * admin list still produces the move the user saw.
 */
export function createReorderHandler({ order, noun, sqlFile, revalidate = [] }: Options) {
  const failed = (e: unknown) => {
    console.error(`Reorder ${noun} failed:`, e)
    if ((e as { code?: string })?.code === UNDEFINED_COLUMN) {
      return NextResponse.json(
        { error: `${noun[0].toUpperCase()}${noun.slice(1)}s cannot be ordered until ${sqlFile} has been run` },
        { status: 501 },
      )
    }
    return NextResponse.json({ error: `Could not reorder ${noun}` }, { status: 500 })
  }

  const done = () => {
    for (const path of revalidate) revalidatePath(path)
    return NextResponse.json({ success: true })
  }

  return async function POST(req: NextRequest) {
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
      return NextResponse.json({ error: `Invalid ${noun} id` }, { status: 400 })
    }

    const sb = supabaseAdmin()

    // ---- Drag & drop: place relative to a neighbour row ----
    if (body.targetId !== undefined || body.placement !== undefined) {
      const targetId = Number(body.targetId)
      const { placement } = body
      if (!Number.isInteger(targetId)) {
        return NextResponse.json({ error: `Invalid target ${noun} id` }, { status: 400 })
      }
      if (placement !== 'before' && placement !== 'after') {
        return NextResponse.json({ error: 'Invalid placement' }, { status: 400 })
      }
      try {
        const ok = await placeRowRelativeTo(sb, order, id, targetId, placement)
        if (!ok) {
          return NextResponse.json(
            { error: `That ${noun} is no longer listed — reload the page` },
            { status: 409 },
          )
        }
      } catch (e) {
        return failed(e)
      }
      return done()
    }

    // ---- Move to an explicit position ----
    if (body.position !== undefined) {
      const position = Number(body.position)
      if (!Number.isInteger(position) || position < 1) {
        return NextResponse.json({ error: 'Invalid position' }, { status: 400 })
      }
      try {
        await repositionRow(sb, order, id, position)
      } catch (e) {
        return failed(e)
      }
      return done()
    }

    // ---- Nudge one step up or down ----
    const { direction } = body
    if (direction !== 'up' && direction !== 'down') {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 })
    }

    // Resolve the row's current position server-side (don't trust the client).
    let ids: number[]
    try {
      ids = await readOrderedIds(sb, order)
    } catch (e) {
      return failed(e)
    }

    const idx = ids.indexOf(id)
    if (idx === -1) {
      return NextResponse.json({ error: `${noun[0].toUpperCase()}${noun.slice(1)} not found` }, { status: 404 })
    }

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= ids.length) {
      // Already at the top/bottom — nothing to do.
      return NextResponse.json({ success: true, noop: true })
    }

    try {
      await repositionRow(sb, order, id, targetIdx + 1) // 1-based position
    } catch (e) {
      return failed(e)
    }

    return done()
  }
}
