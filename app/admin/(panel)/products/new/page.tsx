import { getAllProducts, getCategories } from '@/lib/products'
import ProductForm from '../../ProductForm'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const [categories, products] = await Promise.all([getCategories(), getAllProducts()])
  return <ProductForm categories={categories} total={products.length} />
}
