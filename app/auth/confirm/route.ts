import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/**
 * Verifies an emailed auth link (password recovery, email confirmation, …) via
 * the `token_hash` OTP flow and establishes the session in cookies server-side.
 *
 * Why this exists: the browser client is configured for the PKCE flow, whose
 * `?code=` links can only be completed in the SAME browser that requested them
 * (the code-verifier lives in that browser's storage). That breaks the common
 * "request the reset on my phone, open it on my laptop" case. The `token_hash`
 * flow needs no local verifier, so it works on ANY device — we just exchange
 * the hashed token for a session here, then hand off to the reset page.
 *
 * Requires the Supabase "Reset Password" email template to point here, e.g.:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/account/reset-password
 */
const VALID_TYPES: EmailOtpType[] = ['recovery', 'email', 'signup', 'invite', 'magiclink', 'email_change']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const nextParam = searchParams.get('next') ?? '/account/reset-password'

  // Only allow same-origin relative redirects (guard against open redirect).
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/account/reset-password'

  if (token_hash && type && VALID_TYPES.includes(type)) {
    const supabase = createSupabaseServerClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      // Session cookie is now set — the reset page will detect it and show the
      // "set a new password" form. `redirect()` preserves the Set-Cookie header.
      redirect(next)
    }
  }

  // Invalid / expired / already-used link → the reset page renders its
  // "request a new link" state when it finds no recovery session.
  redirect('/account/reset-password?error=invalid_link')
}
