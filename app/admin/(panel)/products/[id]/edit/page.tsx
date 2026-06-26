import { notFound } from 'next/navigation'
import { getAllProducts, getCategories } from '@/lib/products'
import ProductForm from '../../../ProductForm'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isInteger(id)) notFound()

  // getAllProducts() is ordered by sort_order, so the index gives the catalog rank.
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()])
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) notFound()

  return (
    <ProductForm
      categories={categories}
      initial={products[index]}
      position={index + 1}
      total={products.length}
    />
  )
}
