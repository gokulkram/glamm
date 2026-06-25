import { notFound } from 'next/navigation'
import { getBlogPost } from '@/lib/blog'
import BlogForm from '../../BlogForm'

export const dynamic = 'force-dynamic'

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isInteger(id)) notFound()

  const post = await getBlogPost(id)
  if (!post) notFound()

  return <BlogForm initial={post} />
}
