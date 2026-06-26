import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Product, Category } from '@/lib/data'

// Shape of a row in the public.products table (snake_case).
type ProductRow = {
  id: number
  slug: string
  title: string
  description: string | null
  category: string
  price_min: number | string
  price_max: number | string
  image: string | null
  sizes: string[] | null
  sizes_prices: Record<string, number> | null
  in_stock: boolean
  published: boolean
  badge: string | null
  features: string[] | null
  benefits: string[] | null
}

// Map a DB row to the camelCase `Product` shape used across the UI.
function mapProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description ?? '',
    category: r.category,
    priceMin: Number(r.price_min),
    priceMax: Number(r.price_max),
    image: r.image ?? '',
    sizes: r.sizes ?? [],
    sizes_prices: r.sizes_prices ?? {},
    inStock: r.in_stock,
    published: r.published,
    badge: r.badge ?? undefined,
    features: r.features ?? [],
    benefits: r.benefits ?? [],
  }
}

const PRODUCT_COLUMNS =
  'id, slug, title, description, category, price_min, price_max, image, sizes, sizes_prices, in_stock, published, badge, features, benefits'

/** Published products only — for every public surface (home, shop, API, pricing). */
export async function getProducts(): Promise<Product[]> {
  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    console.error('getProducts failed:', error)
    return []
  }
  return (data as ProductRow[]).map(mapProduct)
}

/** All products, published or not — for the admin panel only. */
export async function getAllProducts(): Promise<Product[]> {
  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('products')
    .select(PRODUCT_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    console.error('getAllProducts failed:', error)
    return []
  }
  return (data as ProductRow[]).map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    console.error('getProductBySlug failed:', error)
    return null
  }
  return data ? mapProduct(data as ProductRow) : null
}

export async function getProductById(id: number): Promise<Product | null> {
  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('getProductById failed:', error)
    return null
  }
  return data ? mapProduct(data as ProductRow) : null
}

export type AdminCategory = Category & { id: number }

async function fetchCategoriesWithCounts(): Promise<AdminCategory[]> {
  const sb = supabaseAdmin()
  const [{ data: cats, error: catErr }, { data: prods, error: prodErr }] = await Promise.all([
    sb.from('categories').select('id, name, slug, sort_order').order('sort_order', { ascending: true }),
    sb.from('products').select('category'),
  ])

  if (catErr || prodErr) {
    console.error('getCategories failed:', catErr || prodErr)
    return []
  }

  const counts = new Map<string, number>()
  for (const p of (prods as { category: string }[]) ?? []) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  }

  return ((cats as { id: number; name: string; slug: string }[]) ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: counts.get(c.name) ?? 0,
  }))
}

export async function getCategories(): Promise<Category[]> {
  const cats = await fetchCategoriesWithCounts()
  return cats.map(({ name, slug, count }) => ({ name, slug, count }))
}

/** Admin variant that also includes the category id (needed for delete). */
export async function getAdminCategories(): Promise<AdminCategory[]> {
  return fetchCategoriesWithCounts()
}
