import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  SHIPPING_FILES_ALLOWED_TYPES,
  SHIPPING_FILES_BUCKET,
  SHIPPING_FILES_MAX_BYTES,
  shippingFileKind,
} from '@/lib/shippingFiles'

export const runtime = 'nodejs'

/**
 * Uploads one shipping label, customs form, or package photo for an order.
 * Admin-only — mirrors app/api/account/orders/[id]/claim/upload, but the
 * caller is support rather than the customer, and nothing here is ever
 * shown on the customer's own order page.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = supabaseAdmin()
  const { data: order } = await sb.from('orders').select('id').eq('id', params.id).maybeSingle()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

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

  const ext = SHIPPING_FILES_ALLOWED_TYPES[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Unsupported file type. Use JPG, PNG, WebP, GIF or PDF.' }, { status: 400 })
  }
  if (file.size > SHIPPING_FILES_MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${Math.round(SHIPPING_FILES_MAX_BYTES / (1024 * 1024))} MB)` },
      { status: 400 },
    )
  }

  // Foldered by order so an order's files stay together, and named randomly
  // so the uploaded filename never becomes part of the stored path.
  const path = `${order.id}/${crypto.randomUUID()}.${ext}`

  const bytes = Buffer.from(await file.arrayBuffer())
  const { error } = await sb.storage.from(SHIPPING_FILES_BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  })
  if (error) {
    console.error('Shipping file upload failed:', error)
    return NextResponse.json({ error: 'Could not upload file' }, { status: 500 })
  }

  // The bucket is private, so hand back a short-lived URL purely so the form
  // can show a thumbnail/link. Only `path` is stored on the order.
  const { data: signed } = await sb.storage.from(SHIPPING_FILES_BUCKET).createSignedUrl(path, 60 * 60)

  return NextResponse.json({ success: true, kind: shippingFileKind(path), path, url: signed?.signedUrl ?? null })
}
