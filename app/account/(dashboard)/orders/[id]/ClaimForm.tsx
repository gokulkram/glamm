'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, FileText, Loader2, Plus, Upload, X } from 'lucide-react'

// Mirrors lib/claims.ts and the upload route. The server re-validates — these
// exist so an obviously-wrong file fails instantly instead of after a round
// trip, and must be kept in step with the route.
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const PHOTO_MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_PHOTOS = 6

const DOCUMENT_TYPES = ['application/pdf']
const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_DOCUMENTS = 3

const MAX_DESCRIPTION = 2000

const field =
  'w-full px-3 py-2 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

/** An uploaded file: `path` is what we store, `url` is signed for preview. */
type UploadedFile = { path: string; url: string | null }

/**
 * Lets a customer report a damaged delivery with photos and, optionally, a
 * supporting document (e.g. a receipt).
 *
 * Files upload as they are picked and the claim row is created on submit, so
 * an abandoned form can leave a file or two behind in the private bucket.
 * That is deliberate: staging files client-side would mean re-implementing
 * the upload for no benefit a customer would notice.
 */
export default function ClaimForm({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<UploadedFile[]>([])
  const [documents, setDocuments] = useState<UploadedFile[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [uploadingDocuments, setUploadingDocuments] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [draggingDocs, setDraggingDocs] = useState(false)

  // dragenter/dragleave fire for every child too, so a plain boolean flickers
  // as the pointer crosses a thumbnail. Counting depth doesn't.
  const dragDepth = useRef(0)
  const dragDepthDocs = useRef(0)
  // setUploading is async, so two drops landing in the same tick would both
  // see uploading === false and race. A ref settles it synchronously.
  const uploadingPhotosRef = useRef(false)
  const uploadingDocumentsRef = useRef(false)

  const photosFull = photos.length >= MAX_PHOTOS
  const documentsFull = documents.length >= MAX_DOCUMENTS

  /** Shared upload path for both photos and documents — only the limits differ. */
  const uploadFiles = async (
    files: File[],
    opts: {
      current: UploadedFile[]
      setCurrent: React.Dispatch<React.SetStateAction<UploadedFile[]>>
      uploadingRef: React.MutableRefObject<boolean>
      setUploading: (v: boolean) => void
      acceptedTypes: string[]
      maxBytes: number
      maxCount: number
      noun: string // "photo" | "document", for messages
      typeHint: string // e.g. "JPG, PNG, WebP or GIF" / "PDF"
    },
  ) => {
    const { current, setCurrent, uploadingRef, setUploading, acceptedTypes, maxBytes, maxCount, noun, typeHint } =
      opts
    if (uploadingRef.current || !files.length) return
    const room = maxCount - current.length
    if (room <= 0) {
      setError(`You can attach up to ${maxCount} ${noun}${maxCount === 1 ? '' : 's'}.`)
      return
    }
    // Take what fits rather than rejecting the whole drop, and say so.
    const batch = files.slice(0, room)
    if (files.length > room) {
      setError(`Only the first ${room} ${noun}${room === 1 ? '' : 's'} were added — ${maxCount} is the limit.`)
    } else {
      setError(null)
    }

    uploadingRef.current = true
    setUploading(true)
    try {
      for (const file of batch) {
        if (!acceptedTypes.includes(file.type)) {
          setError(`Unsupported file type. Use ${typeHint}.`)
          continue
        }
        if (file.size > maxBytes) {
          setError(`That ${noun} is too large (max ${Math.round(maxBytes / (1024 * 1024))} MB).`)
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
          setCurrent((prev) => [...prev, { path: data.path, url: data.url }])
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

  const uploadPhotos = (files: File[]) =>
    uploadFiles(files, {
      current: photos,
      setCurrent: setPhotos,
      uploadingRef: uploadingPhotosRef,
      setUploading: setUploadingPhotos,
      acceptedTypes: PHOTO_TYPES,
      maxBytes: PHOTO_MAX_BYTES,
      maxCount: MAX_PHOTOS,
      noun: 'photo',
      typeHint: 'JPG, PNG, WebP or GIF',
    })

  const uploadDocuments = (files: File[]) =>
    uploadFiles(files, {
      current: documents,
      setCurrent: setDocuments,
      uploadingRef: uploadingDocumentsRef,
      setUploading: setUploadingDocuments,
      acceptedTypes: DOCUMENT_TYPES,
      maxBytes: DOCUMENT_MAX_BYTES,
      maxCount: MAX_DOCUMENTS,
      noun: 'document',
      typeHint: 'PDF',
    })

  const handlePickPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = '' // let the same file be re-selected later
    if (files.length) uploadPhotos(files)
  }

  const handlePickDocuments = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length) uploadDocuments(files)
  }

  const removeFile = async (file: UploadedFile, setCurrent: React.Dispatch<React.SetStateAction<UploadedFile[]>>) => {
    setCurrent((prev) => prev.filter((p) => p.path !== file.path))
    // Best effort — the claim isn't filed yet, so a failure here only leaves an
    // unreferenced file behind and shouldn't interrupt the customer.
    try {
      await fetch(`/api/account/orders/${orderId}/claim?path=${encodeURIComponent(file.path)}`, {
        method: 'DELETE',
      })
    } catch {
      /* nothing the customer can act on */
    }
  }

  // Only files are droppable here.
  const hasFiles = (e: React.DragEvent) => e.dataTransfer.types.includes('Files')

  /** Shared drag-and-drop wiring for a dropzone — only the upload target differs. */
  const makeDragHandlers = (opts: {
    disabled: boolean
    depthRef: React.MutableRefObject<number>
    dragging: boolean
    setDragging: (v: boolean) => void
    upload: (files: File[]) => void
  }) => {
    const { disabled, depthRef, dragging, setDragging, upload } = opts
    return {
      onDragEnter: (e: React.DragEvent) => {
        if (disabled || !hasFiles(e)) return
        e.preventDefault()
        depthRef.current += 1
        setDragging(true)
      },
      onDragLeave: (e: React.DragEvent) => {
        if (!dragging) return
        e.preventDefault()
        depthRef.current -= 1
        if (depthRef.current <= 0) {
          depthRef.current = 0
          setDragging(false)
        }
      },
      onDragOver: (e: React.DragEvent) => {
        if (disabled || !hasFiles(e)) return
        e.preventDefault() // without this, onDrop never fires
        e.dataTransfer.dropEffect = 'copy'
      },
      onDrop: (e: React.DragEvent) => {
        if (!hasFiles(e)) return
        e.preventDefault()
        depthRef.current = 0
        setDragging(false)
        const files = Array.from(e.dataTransfer.files ?? [])
        if (files.length) upload(files)
      },
    }
  }

  const photoDrag = makeDragHandlers({
    disabled: uploadingPhotos || photosFull,
    depthRef: dragDepth,
    dragging,
    setDragging,
    upload: uploadPhotos,
  })

  const documentDrag = makeDragHandlers({
    disabled: uploadingDocuments || documentsFull,
    depthRef: dragDepthDocs,
    dragging: draggingDocs,
    setDragging: setDraggingDocs,
    upload: uploadDocuments,
  })

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
        body: JSON.stringify({
          description: description.trim(),
          photo_paths: photos.map((p) => p.path),
          document_paths: documents.map((d) => d.path),
        }),
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
          {...photoDrag}
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
                    onClick={() => removeFile(p, setPhotos)}
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
              uploadingPhotos || photosFull ? 'pointer-events-none opacity-70' : 'cursor-pointer'
            }`}
          >
            {uploadingPhotos ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : photos.length ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploadingPhotos ? 'Uploading…' : photos.length ? 'Add another photo' : 'Add photos'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handlePickPhotos}
              disabled={uploadingPhotos || photosFull}
            />
          </label>

          <p className="text-xs text-text-muted mt-2">
            {dragging
              ? 'Drop the photos to upload them.'
              : photosFull
                ? `That is the maximum of ${MAX_PHOTOS} photos.`
                : `Drag photos here, or use the button. JPG, PNG, WebP or GIF, up to 5 MB each — ${MAX_PHOTOS} photos max.`}
          </p>
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium mb-1.5">
          Documents <span className="font-normal text-text-muted">(optional)</span>
        </span>
        <div
          {...documentDrag}
          className={`rounded-lg border border-dashed p-4 transition-colors ${
            draggingDocs ? 'border-accent bg-accent/5' : 'border-border'
          }`}
        >
          {documents.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {documents.map((d, i) => (
                <div
                  key={d.path}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface pl-3 pr-2 py-1.5 text-sm"
                >
                  <FileText className="h-4 w-4 text-text-muted shrink-0" />
                  Document {i + 1}
                  <button
                    type="button"
                    onClick={() => removeFile(d, setDocuments)}
                    aria-label="Remove document"
                    className="flex h-5 w-5 items-center justify-center rounded-full text-text-muted hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label
            className={`btn btn-secondary inline-flex ${
              uploadingDocuments || documentsFull ? 'pointer-events-none opacity-70' : 'cursor-pointer'
            }`}
          >
            {uploadingDocuments ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : documents.length ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploadingDocuments ? 'Uploading…' : documents.length ? 'Add another document' : 'Add a document'}
            <input
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={handlePickDocuments}
              disabled={uploadingDocuments || documentsFull}
            />
          </label>

          <p className="text-xs text-text-muted mt-2">
            {draggingDocs
              ? 'Drop the document to upload it.'
              : documentsFull
                ? `That is the maximum of ${MAX_DOCUMENTS} documents.`
                : `Drag a document here, or use the button. A receipt or packing slip, if you have one. PDF, up to 10 MB each — ${MAX_DOCUMENTS} documents max.`}
          </p>
        </div>
      </div>

      {error && (
        <p className="flex items-start gap-1.5 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={submitting || uploadingPhotos || uploadingDocuments}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Submitting…' : 'Submit damage report'}
      </button>
    </form>
  )
}
