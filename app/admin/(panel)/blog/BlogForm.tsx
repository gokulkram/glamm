'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react'
import type { BlogPost } from '@/lib/blog'

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function BlogForm({ initial }: { initial?: BlogPost }) {
  const router = useRouter()
  const isEdit = !!initial

  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [author, setAuthor] = useState(initial?.author ?? '')
  const [image, setImage] = useState(initial?.image ?? '')
  const [readTime, setReadTime] = useState(initial?.readTime ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [published, setPublished] = useState(initial?.published ?? true)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const onTitleChange = (v: string) => {
    setTitle(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same file be re-selected later
    if (!file) return
    setUploadError(null)
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/blog/upload', { method: 'POST', body: fd })
    const data = await res.json().catch(() => ({}))
    setUploading(false)
    if (!res.ok) {
      setUploadError(data.error || 'Upload failed')
      return
    }
    setImage(data.url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload = { title, slug, excerpt, category, author, image, readTime, content, published }
    const res = await fetch(isEdit ? `/api/admin/blog/${initial!.id}` : '/api/admin/blog', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setSaving(false)
      return
    }
    router.push('/admin/blog')
    router.refresh()
  }

  const field =
    'w-full px-3 py-2 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to blog
      </Link>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Post' : 'Add Post'}</h1>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-5">{error}</div>
      )}

      <div className="space-y-5">
        {/* Basics */}
        <div className="card p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input className={field} value={title} onChange={(e) => onTitleChange(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug *</label>
              <input
                className={field}
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugTouched(true)
                }}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Excerpt</label>
            <textarea className={field} rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary shown on the blog listing" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <input className={field} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Care Tips" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Author</label>
              <input className={field} value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g. Sarah Johnson" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Read time</label>
              <input className={field} value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="e.g. 5 min read" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Cover image</label>
            <div className="flex items-start gap-4">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="Cover preview" className="h-24 w-32 shrink-0 rounded-lg border border-border object-cover bg-surface" />
              ) : (
                <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-surface text-text-muted">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <label className={`btn btn-secondary inline-flex ${uploading ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? 'Uploading…' : 'Upload image'}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
                {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
                <input className={field} value={image} onChange={(e) => setImage(e.target.value)} placeholder="…or paste an image URL / path" />
                <p className="text-xs text-text-muted">JPG, PNG, WebP or GIF, up to 5 MB. Uploads are stored in Supabase Storage.</p>
              </div>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-[#f68961]" />
            Published (visible on the site)
          </label>
        </div>

        {/* Body */}
        <div className="card p-6">
          <label className="block text-sm font-medium mb-1.5">Content</label>
          <textarea
            className={`${field} font-mono text-sm`}
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={'Write your post here...\n\n## A heading\n\n- A bullet point\n- Another bullet\n\nA normal paragraph of text.'}
          />
          <p className="text-xs text-text-muted mt-2">
            Formatting: <code>## </code> starts a heading, lines starting with <code>- </code> become bullet points,
            and blank lines separate paragraphs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : isEdit ? 'Save changes' : 'Create post'}
          </button>
          <Link href="/admin/blog" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  )
}
