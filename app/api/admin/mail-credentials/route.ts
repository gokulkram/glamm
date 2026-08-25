import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { getStoredMailCredentials, setStoredMailCredentials } from '@/lib/mailCredentials'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type FieldKind = 'text' | 'secret'
// envFallback can list more than one env var to check in order — 'notify'
// falls back to ORDER_NOTIFY_EMAILS, then ADMIN_EMAILS, same chain
// notificationRecipients() in lib/email.ts uses.
type FieldSpec = { key: string; kind: FieldKind; envFallback: string[] }

// 'text' fields are safe to show/edit plainly — host/port/user/from/notify
// aren't confidential. 'pass' is write-only: only a boolean "is something
// set" ever leaves the server.
const FIELDS: FieldSpec[] = [
  { key: 'host', kind: 'text', envFallback: ['SMTP_HOST'] },
  { key: 'port', kind: 'text', envFallback: ['SMTP_PORT'] },
  { key: 'user', kind: 'text', envFallback: ['SMTP_USER'] },
  { key: 'from', kind: 'text', envFallback: ['SMTP_FROM'] },
  { key: 'pass', kind: 'secret', envFallback: ['SMTP_PASS'] },
  { key: 'notify', kind: 'text', envFallback: ['ORDER_NOTIFY_EMAILS', 'ADMIN_EMAILS'] },
]

function envFallbackValue(names: string[]): string | undefined {
  for (const name of names) {
    const v = process.env[name]
    if (v) return v
  }
  return undefined
}

// Admin-only: which SMTP/notification fields are set, and their values for
// the non-secret ones. GET never returns the password's actual value — only
// whether one is currently in effect (saved override, or env var).
export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stored = await getStoredMailCredentials()

  const out: Record<string, unknown> = {}
  for (const field of FIELDS) {
    const savedValue = stored[field.key]
    const envValue = envFallbackValue(field.envFallback)
    const source = savedValue ? 'saved' : envValue ? 'environment' : 'none'
    if (field.kind === 'secret') {
      out[field.key] = { set: source !== 'none', source }
    } else {
      out[field.key] = { value: savedValue || envValue || '', source }
    }
  }

  return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } })
}

// Save SMTP credentials. Blank/omitted fields leave the existing saved value
// untouched (see lib/mailCredentials.ts) — this is what makes leaving the
// password input blank on the form safe.
export async function PATCH(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { fields?: Record<string, string> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const allowedKeys = new Set(FIELDS.map((f) => f.key))
  const patch: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(body.fields ?? {})) {
    if (allowedKeys.has(k) && typeof v === 'string') patch[k] = v
  }

  if (patch.port && !/^\d+$/.test(patch.port.trim())) {
    return NextResponse.json({ error: 'Port must be a number' }, { status: 400 })
  }

  if (patch.notify) {
    const emails = patch.notify.split(',').map((s) => s.trim()).filter(Boolean)
    if (emails.some((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))) {
      return NextResponse.json({ error: 'Notify emails must be a comma-separated list of valid emails' }, { status: 400 })
    }
    patch.notify = emails.join(',')
  }

  const result = await setStoredMailCredentials(patch)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ success: true })
}
