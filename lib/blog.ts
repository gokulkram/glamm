import { supabaseAdmin } from '@/lib/supabase/admin'

export type BlogBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }

export type BlogPost = {
  id: number
  slug: string
  title: string
  excerpt: string
  author: string
  category: string
  image: string
  readTime: string
  date: string
  published: boolean
  /** Raw markdown-lite body. Use parseContent() to render. */
  content: string
}

type BlogRow = {
  id: number
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  author: string | null
  category: string | null
  image: string | null
  read_time: string | null
  published: boolean
  created_at: string
}

const COLUMNS =
  'id, slug, title, excerpt, content, author, category, image, read_time, published, created_at'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function mapPost(r: BlogRow): BlogPost {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? '',
    author: r.author ?? '',
    category: r.category ?? '',
    image: r.image ?? '',
    readTime: r.read_time ?? '',
    date: formatDate(r.created_at),
    published: r.published,
    content: r.content ?? '',
  }
}

/**
 * Turn markdown-lite body text into renderable blocks:
 *  - lines starting with "## " become headings
 *  - consecutive lines starting with "- " become a bullet list
 *  - blank-line-separated runs of text become paragraphs
 */
export function parseContent(raw: string): BlogBlock[] {
  const blocks: BlogBlock[] = []
  const lines = (raw || '').replace(/\r\n/g, '\n').split('\n')

  let para: string[] = []
  let list: string[] = []
  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'paragraph', text: para.join(' ').trim() })
      para = []
    }
  }
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: 'list', items: list.slice() })
      list = []
    }
  }

  for (const line of lines) {
    const t = line.trim()
    if (!t) {
      flushPara()
      flushList()
      continue
    }
    if (t.startsWith('## ')) {
      flushPara()
      flushList()
      blocks.push({ type: 'heading', text: t.slice(3).trim() })
      continue
    }
    if (t.startsWith('- ')) {
      flushPara()
      list.push(t.slice(2).trim())
      continue
    }
    flushList()
    para.push(t)
  }
  flushPara()
  flushList()
  return blocks
}

/** Published posts for the public blog, newest/curated first. */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('blog_posts')
    .select(COLUMNS)
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getBlogPosts failed:', error)
    return []
  }
  return (data as BlogRow[]).map(mapPost)
}

/** All posts (published or not) for the admin panel. */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('blog_posts')
    .select(COLUMNS)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllBlogPosts failed:', error)
    return []
  }
  return (data as BlogRow[]).map(mapPost)
}

export async function getBlogPost(id: number): Promise<BlogPost | null> {
  if (!Number.isInteger(id)) return null
  const sb = supabaseAdmin()
  const { data, error } = await sb.from('blog_posts').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) {
    console.error('getBlogPost failed:', error)
    return null
  }
  return data ? mapPost(data as BlogRow) : null
}
