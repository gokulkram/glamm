import type { User } from '@supabase/supabase-js'
import { createSupabaseServerClient } from './server'

/** Emails allowed into the admin panel (comma-separated in ADMIN_EMAILS). */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  const allow = getAdminEmails()
  // Default-deny: if no allowlist is configured, nobody is an admin.
  return allow.includes(email.toLowerCase())
}

/**
 * Returns the current user IF they are signed in AND on the admin allowlist,
 * otherwise null. Use in server components / route handlers to gate access.
 */
export async function getAdminUser(): Promise<User | null> {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) return null
  return user
}
