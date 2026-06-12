import { NextResponse } from 'next/server'
import { getProducts, getCategories } from '@/lib/products'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Public catalog endpoint used by client components (shop, wishlist, product page).
export async function GET() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  return NextResponse.json({ products, categories })
}
