import { getAdminCategories } from '@/lib/products'
import CategoryManager from './CategoryManager'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const categories = await getAdminCategories()
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-text-muted text-sm">Add or remove product categories</p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  )
}
