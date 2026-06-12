import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { products, categories } from '@/lib/data'

export const runtime = 'nodejs'

/**
 * One-time (idempotent) seed: copies the static catalog from lib/data.ts
 * into the Supabase `products` and `categories` tables.
 *
 * Guarded so it cannot run in production. Re-running is safe — it upserts.
 */
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seeding is disabled in production' }, { status: 403 })
  }

  const sb = supabaseAdmin()

  const categoryRows = categories.map((c, i) => ({
    name: c.name,
    slug: c.slug,
    sort_order: i,
  }))

  const productRows = products.map((p, i) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    price_min: p.priceMin,
    price_max: p.priceMax,
    image: p.image,
    sizes: p.sizes,
    sizes_prices: p.sizes_prices,
    in_stock: p.inStock,
    badge: p.badge ?? null,
    features: p.features,
    benefits: p.benefits,
    sort_order: i,
  }))

  const { error: catErr } = await sb.from('categories').upsert(categoryRows, { onConflict: 'slug' })
  if (catErr) {
    console.error('Seed categories failed:', catErr)
    return NextResponse.json({ error: 'categories: ' + catErr.message }, { status: 500 })
  }

  const { error: prodErr } = await sb.from('products').upsert(productRows, { onConflict: 'id' })
  if (prodErr) {
    console.error('Seed products failed:', prodErr)
    return NextResponse.json({ error: 'products: ' + prodErr.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    seeded: { categories: categoryRows.length, products: productRows.length },
  })
}
