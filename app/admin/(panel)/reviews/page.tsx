import { getAllReviews } from '@/lib/reviews'
import { getAllProducts } from '@/lib/products'
import ReviewsTable from './ReviewsTable'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const [reviews, products] = await Promise.all([getAllReviews(), getAllProducts()])
  // Slug travels with the title so each row can link through to the product.
  const productsById: Record<number, { title: string; slug: string }> = {}
  for (const p of products) productsById[p.id] = { title: p.title, slug: p.slug }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-text-muted text-sm">
          Approve customer reviews to publish them, and drag rows to set the order they appear in.
        </p>
      </div>
      <ReviewsTable reviews={reviews} products={productsById} />
    </div>
  )
}
