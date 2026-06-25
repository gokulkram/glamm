export type BlogInput = {
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  author?: string
  category?: string
  image?: string
  readTime?: string
  published?: boolean
}

export type BlogRow = {
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  category: string
  image: string
  read_time: string
  published: boolean
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Validate + normalise a blog post payload into a DB row. */
export function buildBlogRow(input: BlogInput): { row?: BlogRow; error?: string } {
  const title = (input.title ?? '').trim()
  if (!title) return { error: 'Title is required' }

  const slug = (input.slug ?? '').trim() ? slugify(input.slug!.trim()) : slugify(title)
  if (!slug) return { error: 'A valid slug is required' }

  return {
    row: {
      title,
      slug,
      excerpt: (input.excerpt ?? '').trim(),
      content: input.content ?? '',
      author: (input.author ?? '').trim(),
      category: (input.category ?? '').trim(),
      image: (input.image ?? '').trim(),
      read_time: (input.readTime ?? '').trim(),
      published: input.published ?? true,
    },
  }
}
