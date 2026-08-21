import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Calendar, User, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import { getBlogPost, getBlogPosts } from '@/lib/blog'
import { renderRichText } from '@/lib/richText'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await getBlogPost(Number(params.id))
  if (!post) return { title: 'Post not found | Glamm Hair' }
  return {
    title: `${post.title} | Glamm Hair Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.image] },
  }
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const post = await getBlogPost(Number(params.id))
  if (!post || !post.published) notFound()

  const bodyHtml = renderRichText(post.content)
  const related = (await getBlogPosts()).filter((p) => p.id !== post.id).slice(0, 2)

  return (
    <article className="section">
      <div className="container-max max-w-3xl">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>

        {/* Header */}
        <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-4">
          {post.category}
        </span>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted mb-8">
          <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {post.author}</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {post.date}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {post.readTime}</span>
        </div>

        {/* Hero image */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 shadow-sm">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        {/* Body. Sanitised in renderRichText — see lib/richText.ts. */}
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-br from-accent/10 to-accent-dark/10 border border-accent/20 p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Ready to transform your look?</h3>
          <p className="text-text-muted mb-5">Explore our collection of 100% virgin human hair extensions.</p>
          <Link href="/shop" className="btn btn-primary inline-flex items-center gap-2">
            Shop the Collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-bold mb-6">Keep reading</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {related.map((rp) => (
                <Link key={rp.id} href={`/blog/${rp.id}`} className="card group overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={rp.image}
                      alt={rp.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-accent font-semibold">{rp.category}</span>
                    <h4 className="font-bold mt-1 group-hover:text-accent transition-colors">{rp.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
