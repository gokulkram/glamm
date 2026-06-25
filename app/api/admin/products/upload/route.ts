import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const BUCKET = 'product-images'
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function slugify(s: string) {
  return s.toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
}

// Upload a product image to Supabase Storage and return its public URL.
export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
  const ext = ALLOWED[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Unsupported file type. Use JPG, PNG, WebP or GIF.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })
  }

  const base = slugify(file.name || 'image') || 'image'
  const path = `${base}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  const sb = supabaseAdmin()
  const bytes = Buffer.from(await file.arrayBuffer())
  const { error } = await sb.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  })
  if (error) {
    console.error('Product image upload failed:', error)
    return NextResponse.json({ error: 'Could not upload image' }, { status: 500 })
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({ success: true, url: data.publicUrl })
}
