import { NextRequest, NextResponse } from 'next/server'
import { sendContactMessage } from '@/lib/email'

export const runtime = 'nodejs'

const SUBJECT_LABELS: Record<string, string> = {
  'product-inquiry': 'Product Inquiry',
  'order-status': 'Order Status',
  'styling-advice': 'Styling Advice',
  returns: 'Returns & Exchanges',
  wholesale: 'Wholesale Inquiry',
  other: 'Other',
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Honeypot — bots fill this hidden field; pretend success and drop it.
  if (body.company) return NextResponse.json({ success: true })

  const name = (body.name || '').trim()
  const email = (body.email || '').trim()
  const message = (body.message || '').trim()
  const phone = (body.phone || '').trim()
  const subject = SUBJECT_LABELS[body.subject] || (body.subject || '').trim() || 'New message'

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Please fill in your name, email and message.' }, { status: 400 })
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: 'Your message is too long.' }, { status: 400 })
  }

  const ok = await sendContactMessage({ name, email, phone, subject, message })
  if (!ok) {
    return NextResponse.json(
      { error: 'Could not send your message right now. Please email us directly at support@glammhair.com.' },
      { status: 500 },
    )
  }
  return NextResponse.json({ success: true })
}
