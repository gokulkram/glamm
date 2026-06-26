import { getAllReviews } from '@/lib/reviews'
import { getAllProducts } from '@/lib/products'
import ReviewsTable from './ReviewsTable'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const [reviews, products] = await Promise.all([getAllReviews(), getAllProducts()])
  const productTitles: Record<number, string> = {}
  for (const p of products) productTitles[p.id] = p.title

  const pending = reviews.filter((r) => r.status === 'pending').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-text-muted text-sm">
          Approve customer reviews to publish them.
          {pending > 0 && <span className="ml-1 font-medium text-accent">{pending} pending</span>}
        </p>
      </div>
      <ReviewsTable reviews={reviews} productTitles={productTitles} />
    </div>
  )
}
