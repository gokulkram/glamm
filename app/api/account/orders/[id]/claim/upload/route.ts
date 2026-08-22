import { NextRequest, NextResponse } from 'next/server'
import { getMyOrderDetail } from '@/lib/account/data'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CLAIM_ALLOWED_TYPES, CLAIM_BUCKET, CLAIM_MAX_BYTES, isClaimable } from '@/lib/claims'

export const runtime = 'nodejs'

/**
 * Uploads one damage photo for an order the signed-in customer owns.
 *
 * Mirrors app/api/admin/products/upload, with two deliberate differences:
 * the caller is a customer rather than an admin, and the bucket is private,
 * so this returns a storage path instead of a public URL.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // getMyOrderDetail authorises by email, matching how guest orders are
  // claimed onto an account. A user_id check here would lock out customers
  // who can see the order but placed it as a guest.
  const order = await getMyOrderDetail(params.id)
  if (!order) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isClaimable(order.status)) {
    return NextResponse.json({ error: 'This order is not eligible for a damage report.' }, { status: 400 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  const ext = CLAIM_ALLOWED_TYPES[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Unsupported file type. Use JPG, PNG, WebP or GIF.' }, { status: 400 })
  }
  if (file.size > CLAIM_MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })
  }

  // Foldered by order so a claim's photos stay together, and named randomly so
  // the customer's own filename never becomes part of the stored path.
  const path = `${order.id}/${crypto.randomUUID()}.${ext}`

  const sb = supabaseAdmin()
  const bytes = Buffer.from(await file.arrayBuffer())
  const { error } = await sb.storage.from(CLAIM_BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  })
  if (error) {
    console.error('Claim photo upload failed:', error)
    return NextResponse.json({ error: 'Could not upload photo' }, { status: 500 })
  }

  // The bucket is private, so hand back a short-lived URL purely so the form
  // can show a thumbnail. Only `path` is stored on the claim.
  const { data: signed } = await sb.storage.from(CLAIM_BUCKET).createSignedUrl(path, 60 * 60)

  return NextResponse.json({ success: true, path, url: signed?.signedUrl ?? null })
}
