export type ProductInput = {
  slug?: string
  title?: string
  description?: string
  category?: string
  image?: string
  badge?: string
  inStock?: boolean
  published?: boolean
  sizes?: string[]
  sizes_prices?: Record<string, number>
  features?: string[]
  benefits?: string[]
  priceMin?: number
  priceMax?: number
  position?: number
}

export type ProductRow = {
  slug: string
  title: string
  description: string
  category: string
  price_min: number
  price_max: number
  image: string
  sizes: string[]
  sizes_prices: Record<string, number>
  in_stock: boolean
  published: boolean
  badge: string | null
  features: string[]
  benefits: string[]
}

/**
 * Validate an incoming product payload and build the DB row.
 * priceMin/priceMax are derived from the size prices when available, so the
 * displayed range always matches the actual options.
 */
export function buildProductRow(
  input: ProductInput,
): { row?: ProductRow; error?: string } {
  const slug = input.slug?.trim()
  const title = input.title?.trim()
  const category = input.category?.trim()

  if (!title) return { error: 'Title is required' }
  if (!slug) return { error: 'Slug is required' }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: 'Slug must be lowercase letters, numbers and dashes only' }
  }
  if (!category) return { error: 'Category is required' }

  const sizesPrices = input.sizes_prices ?? {}
  const priceValues = Object.values(sizesPrices)
    .map(Number)
    .filter((n) => !isNaN(n))

  const priceMin = priceValues.length ? Math.min(...priceValues) : Number(input.priceMin) || 0
  const priceMax = priceValues.length ? Math.max(...priceValues) : Number(input.priceMax) || 0

  return {
    row: {
      slug,
      title,
      description: input.description?.trim() ?? '',
      category,
      price_min: priceMin,
      price_max: priceMax,
      image: input.image?.trim() ?? '',
      sizes: input.sizes ?? [],
      sizes_prices: sizesPrices,
      in_stock: input.inStock ?? true,
      published: input.published ?? true,
      badge: input.badge?.trim() || null,
      features: (input.features ?? []).filter((f) => f.trim()),
      benefits: (input.benefits ?? []).filter((b) => b.trim()),
    },
  }
}
