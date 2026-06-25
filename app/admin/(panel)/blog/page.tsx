import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getAllBlogPosts } from '@/lib/blog'
import BlogTable from './BlogTable'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const posts = await getAllBlogPosts()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-text-muted text-sm">Write and manage blog posts</p>
        </div>
        <Link href="/admin/blog/new" className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Add Post
        </Link>
      </div>

      <BlogTable posts={posts} />
    </div>
  )
}
