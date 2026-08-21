import { notFound } from 'next/navigation'
import { getBlogPost } from '@/lib/blog'
import { renderRichText } from '@/lib/richText'
import BlogForm from '../../BlogForm'

export const dynamic = 'force-dynamic'

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isInteger(id)) notFound()

  const post = await getBlogPost(id)
  if (!post) notFound()

  // The editor speaks HTML. A post still in the old line-based format would
  // otherwise load as one long paragraph with its "## " and "- " markers as
  // literal text, and saving would flatten the post for good — so convert on
  // the way in. Done here rather than in the form because the converter is
  // server-only. Already-HTML bodies pass through untouched.
  return <BlogForm initial={{ ...post, content: renderRichText(post.content) }} />
}
