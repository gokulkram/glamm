'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Star, MessageCircle, Loader2, CheckCircle } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type Review = {
  id: number
  author_name: string
  rating: number
  title: string | null
  body: string | null
  created_at: string
}
type Summary = { average: number; count: number }

function Stars({ value, size = 'h-4 w-4' }: { value: number; size?: string }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`${size} ${i < Math.round(value) ? 'fill-accent text-accent' : 'text-gray-300'}`} />
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ProductReviews({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<Summary>({ average: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // form state
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const load = useCallback(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews ?? [])
        setSummary(d.summary ?? { average: 0, count: 0 })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(() => {
    load()
    createSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data: { user } }) => setLoggedIn(!!user))
  }, [load])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating < 1) {
      setFormError('Please select a star rating')
      return
    }
    setFormError(null)
    setSubmitting(true)
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, rating, title, body }),
    })
    const data = await res.json().catch(() => ({}))
    setSubmitting(false)
    if (!res.ok) {
      setFormError(data.error || 'Could not submit your review')
      return
    }
    setSubmitted(true)
    setShowForm(false)
    setRating(0)
    setTitle('')
    setBody('')
  }

  return (
    <div className="mb-20">
      <div className="card p-8">
        {/* Header / summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            {summary.count > 0 && (
              <div className="flex items-center gap-2">
                <Stars value={summary.average} />
                <span className="font-bold">{summary.average.toFixed(1)}</span>
                <span className="text-text-muted">({summary.count})</span>
              </div>
            )}
          </div>
          {loggedIn ? (
            <button onClick={() => { setShowForm((s) => !s); setSubmitted(false) }} className="btn btn-secondary">
              <MessageCircle className="w-4 h-4" /> Write a review
            </button>
          ) : (
            <Link href={`/account/login?next=/products`} className="btn btn-secondary">
              <MessageCircle className="w-4 h-4" /> Log in to review
            </Link>
          )}
        </div>

        {submitted && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="w-5 h-5" /> Thanks! Your review was submitted and will appear once approved.
          </div>
        )}

        {/* Write form */}
        {showForm && loggedIn && (
          <form onSubmit={submit} className="mb-8 rounded-2xl border border-border p-6 space-y-4">
            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{formError}</div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Your rating</label>
              <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  >
                    <Star className={`h-7 w-7 transition-colors ${n <= (hover || rating) ? 'fill-accent text-accent' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Title (optional)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                placeholder="Sum it up in a few words"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Your review</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-2.5 rounded-lg border border-border outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                placeholder="What did you think of the hair?"
              />
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit review'}
            </button>
          </form>
        )}

        {/* List */}
        {loading ? (
          <p className="text-text-muted">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-text-muted">No reviews yet. Be the first to share your thoughts!</p>
        ) : (
          <div className="divide-y divide-border">
            {reviews.map((r) => (
              <div key={r.id} className="py-5 first:pt-0">
                <div className="flex items-center gap-3 mb-1">
                  <Stars value={r.rating} />
                  <span className="font-semibold">{r.author_name}</span>
                  <span className="text-xs text-text-muted">{formatDate(r.created_at)}</span>
                </div>
                {r.title && <div className="font-medium">{r.title}</div>}
                {r.body && <p className="text-text-muted leading-relaxed">{r.body}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
