'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader2, Plus, Upload, X } from 'lucide-react'

// Mirrors lib/claims.ts and the upload route. The server re-validates — these
// exist so an obviously-wrong file fails instantly instead of after a round
// trip, and must be kept in step with the route.
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_PHOTOS = 6
const MAX_DESCRIPTION = 2000

const field =
  'w-full px-3 py-2 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

/** An uploaded photo: `path` is what we store, `url` is signed for preview. */
type Photo = { path: string; url: string | null }

/**
 * Lets a customer report a damaged delivery with photos.
 *
 * Photos upload as they are picked and the claim row is created on submit, so
 * an abandoned form can leave a file or two behind in the private bucket.
 * That is deliberate: staging files client-side would mean re-implementing
 * the upload for no benefit a customer would notice.
 */
export default function ClaimForm({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  // dragenter/dragleave fire for every child too, so a plain boolean flickers
  // as the pointer crosses a thumbnail. Counting depth doesn't.
  const dragDepth = useRef(0)
  // setUploading is async, so two drops landing in the same tick would both
  // see uploading === false and race. A ref settles it synchronously.
  const uploadingRef = useRef(false)

  const full = photos.length >= MAX_PHOTOS

  const uploadFiles = async (files: File[]) => {
    if (uploadingRef.current || !files.length) return
    const room = MAX_PHOTOS - photos.length
    if (room <= 0) {
      setError(`You can attach up to ${MAX_PHOTOS} photos.`)
      return
    }
    // Take what fits rather than rejecting the whole drop, and say so.
    const batch = files.slice(0, room)
    if (files.length > room) {
      setError(`Only the first ${room} photo${room === 1 ? '' : 's'} were added — ${MAX_PHOTOS} is the limit.`)
    } else {
      setError(null)
    }

    uploadingRef.current = true
    setUploading(true)
    try {
      for (const file of batch) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError('Unsupported file type. Use JPG, PNG, WebP or GIF.')
          continue
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          setError(`That photo is too large (max 5 MB).`)
          continue
        }
        const fd = new FormData()
        fd.append('file', file)
        try {
          const res = await fetch(`/api/account/orders/${orderId}/claim/upload`, { method: 'POST', body: fd })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) {
            setError(data.error || 'Upload failed')
            continue
          }
          setPhotos((prev) => [...prev, { path: data.path, url: data.url }])
        } catch {
          // Without this the spinner would spin for good on a dropped connection.
          setError('Upload failed — check your connection and try again.')
        }
      }
    } finally {
      uploadingRef.current = false
      setUploading(false)
    }
  }

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = '' // let the same file be re-selected later
    if (files.length) uploadFiles(files)
  }

  const removePhoto = async (photo: Photo) => {
    setPhotos((prev) => prev.filter((p) => p.path !== photo.path))
    // Best effort — the claim isn't filed yet, so a failure here only leaves an
    // unreferenced file behind and shouldn't interrupt the customer.
    try {
      await fetch(`/api/account/orders/${orderId}/claim?path=${encodeURIComponent(photo.path)}`, {
        method: 'DELETE',
      })
    } catch {
      /* nothing the customer can act on */
    }
  }

  // Only files are droppable here.
  const hasFiles = (e: React.DragEvent) => e.dataTransfer.types.includes('Files')

  const onDragEnter = (e: React.DragEvent) => {
    if (uploading || full || !hasFiles(e)) return
    e.preventDefault()
    dragDepth.current += 1
    setDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    if (!dragging) return
    e.preventDefault()
    dragDepth.current -= 1
    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      setDragging(false)
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    if (uploading || full || !hasFiles(e)) return
    e.preventDefault() // without this, onDrop never fires
    e.dataTransfer.dropEffect = 'copy'
  }

  const onDrop = (e: React.DragEvent) => {
    if (!hasFiles(e)) return
    e.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    const files = Array.from(e.dataTransfer.files ?? [])
    if (files.length) uploadFiles(files)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      setError('Please describe the damage.')
      return
    }
    if (photos.length === 0) {
      setError('Please attach at least one photo of the damage.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/account/orders/${orderId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim(), photo_paths: photos.map((p) => p.path) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not submit your report')
        return
      }
      router.refresh() // the page re-renders into the "report filed" state
    } catch {
      setError('Could not submit your report — check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-text-muted">
        Arrived damaged? Tell us what happened and add clear photos of both the outer packaging and the product
        itself. We&apos;ll file an insurance claim for you — please keep all packaging until it&apos;s settled.
      </p>

      <div>
        <label htmlFor="claim-description" className="block text-sm font-medium mb-1.5">
          What&apos;s wrong?
        </label>
        <textarea
          id="claim-description"
          className={`${field} min-h-[110px] resize-y`}
          value={description}
          maxLength={MAX_DESCRIPTION}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the damage — which item, and what you found when the parcel arrived."
        />
      </div>

      <div>
        <span className="block text-sm font-medium mb-1.5">Photos</span>
        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={`rounded-lg border border-dashed p-4 transition-colors ${
            dragging ? 'border-accent bg-accent/5' : 'border-border'
          }`}
        >
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {photos.map((p) => (
                <div key={p.path} className="relative h-20 w-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url ?? ''}
                    alt="Damage photo"
                    className="h-20 w-20 rounded-lg border border-border object-cover bg-surface"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(p)}
                    aria-label="Remove photo"
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white text-text-muted shadow-sm hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label
            className={`btn btn-secondary inline-flex ${
              uploading || full ? 'pointer-events-none opacity-70' : 'cursor-pointer'
            }`}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : photos.length ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? 'Uploading…' : photos.length ? 'Add another photo' : 'Add photos'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handlePick}
              disabled={uploading || full}
            />
          </label>

          <p className="text-xs text-text-muted mt-2">
            {dragging
              ? 'Drop the photos to upload them.'
              : full
                ? `That is the maximum of ${MAX_PHOTOS} photos.`
                : `Drag photos here, or use the button. JPG, PNG, WebP or GIF, up to 5 MB each — ${MAX_PHOTOS} photos max.`}
          </p>
        </div>
      </div>

      {error && (
        <p className="flex items-start gap-1.5 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Submitting…' : 'Submit damage report'}
      </button>
    </form>
  )
}
