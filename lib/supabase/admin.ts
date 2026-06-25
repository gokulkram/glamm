import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

/**
 * Server-only Supabase client using the service_role key.
 * It bypasses Row Level Security, so NEVER import this from a Client Component.
 * Use it only inside API routes / server code to read & write orders.
 *
 * The `realtime.transport` is set to `ws` because Node < 22 has no global
 * WebSocket; supabase-js constructs a realtime client eagerly even though we
 * only use the HTTP (PostgREST) API here.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local',
    )
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    realtime: { transport: ws as any },
    global: {
      // Next.js patches global fetch and caches GETs by default, which would
      // serve stale data after an admin edits products / settings / content.
      // Force every PostgREST request to bypass that cache.
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, cache: 'no-store' }),
    },
  })
}
