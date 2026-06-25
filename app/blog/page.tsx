import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { getBlogPosts } from '@/lib/blog'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const blogPosts = await getBlogPosts()

  return (
    <div className="section">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-title">Hair Care Blog</h1>
          <p className="section-sub max-w-2xl mx-auto">
            Tips, tricks, and inspiration for beautiful hair
          </p>
        </div>

        {blogPosts.length === 0 ? (
          <p className="text-center text-text-muted py-16">No posts yet. Check back soon!</p>
        ) : (
        /* Blog Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="card group overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white text-xs font-semibold">
                  {post.category}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author}
                  </div>
                </div>
                <h2 className="font-bold text-xl mb-3 group-hover:text-accent transition-colors">
                  {post.title}
                </h2>
                <p className="text-text-muted text-sm mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                <Link href={`/blog/${post.id}`} className="inline-flex items-center gap-2 text-accent font-semibold text-sm hover:gap-3 transition-all">
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
        )}
      </div>
    </div>
  )
}

