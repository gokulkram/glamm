import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { buildProductRow, type ProductInput } from '@/lib/admin/productPayload'

export const runtime = 'nodejs'

// Update a product
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
  }

  let input: ProductInput
  try {
    input = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { row, error } = buildProductRow(input)
  if (error || !row) return NextResponse.json({ error: error ?? 'Invalid product' }, { status: 400 })

  const sb = supabaseAdmin()
  const { data, error: updateError } = await sb
    .from('products')
    .update(row)
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (updateError) {
    if (updateError.code === '23505') {
      return NextResponse.json({ error: 'A product with that slug already exists' }, { status: 409 })
    }
    console.error('Update product failed:', updateError)
    return NextResponse.json({ error: 'Could not update product' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, id: data.id })
}

// Delete a product
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = Number(params.id)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
  }

  const sb = supabaseAdmin()
  const { error } = await sb.from('products').delete().eq('id', id)
  if (error) {
    console.error('Delete product failed:', error)
    return NextResponse.json({ error: 'Could not delete product' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
