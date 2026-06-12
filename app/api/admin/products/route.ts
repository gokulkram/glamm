import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { buildProductRow, type ProductInput } from '@/lib/admin/productPayload'

export const runtime = 'nodejs'

// Create a product
export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let input: ProductInput
  try {
    input = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { row, error } = buildProductRow(input)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const sb = supabaseAdmin()

  // Assign the next integer id (products.id is not auto-generated).
  const { data: maxRow } = await sb
    .from('products')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextId = (maxRow?.id ?? 0) + 1

  const { data, error: insertError } = await sb
    .from('products')
    .insert({ id: nextId, ...row, sort_order: nextId })
    .select('id, slug')
    .single()

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'A product with that slug already exists' }, { status: 409 })
    }
    console.error('Create product failed:', insertError)
    return NextResponse.json({ error: 'Could not create product' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id, slug: data.slug })
}
