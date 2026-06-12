import { notFound } from 'next/navigation'
import { getCategories, getProductById } from '@/lib/products'
import ProductForm from '../../../ProductForm'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isInteger(id)) notFound()

  const [product, categories] = await Promise.all([getProductById(id), getCategories()])
  if (!product) notFound()

  return <ProductForm categories={categories} initial={product} />
}
