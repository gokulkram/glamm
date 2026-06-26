import Link from 'next/link'
import { Package, Tags, Plus, Eye, EyeOff } from 'lucide-react'
import { getAllProducts, getCategories } from '@/lib/products'
import ProductTable from './ProductTable'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-text-muted text-sm">Manage your catalog</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold">{products.length}</div>
            <div className="text-xs text-text-muted">Products</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Tags className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-xs text-text-muted">Categories</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Package className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{products.filter((p) => p.inStock).length}</div>
            <div className="text-xs text-text-muted">In stock</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            {products.some((p) => !p.published) ? (
              <EyeOff className="h-5 w-5 text-accent" />
            ) : (
              <Eye className="h-5 w-5 text-accent" />
            )}
          </div>
          <div>
            <div className="text-2xl font-bold">{products.filter((p) => p.published).length}</div>
            <div className="text-xs text-text-muted">Published</div>
          </div>
        </div>
      </div>

      <ProductTable products={products} categories={categories} />
    </div>
  )
}
