'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton — multiple GoTrueClient instances in one tab fight over the auth
// lock and can make getUser()/getSession() hang. Reuse a single instance.
let client: SupabaseClient | undefined

/** Supabase client for Client Components (login form, logout, header menu). */
export function createSupabaseBrowserClient() {
  if (client) return client
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  return client
}
