'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react'

// Mirrors the upload routes under app/api/admin/*/upload. The server
// re-validates — these exist so an obviously-wrong drop fails instantly
// instead of after a round trip, and must be kept in step with the routes.
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 // 5 MB

const field =
  'w-full px-3 py-2 rounded-lg border border-border bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

type Props = {
  /** Field label, e.g. "Product image". */
  label: string
  /** Current image URL or path. */
  value: string
  onChange: (url: string) => void
  /** Admin upload route that returns `{ url }`, e.g. /api/admin/blog/upload. */
  endpoint: string
  /** Preview box size — products are square, blog covers are 4:3. */
  previewClassName?: string
  previewAlt: string
}

/**
 * Image picker shared by the product and blog forms: drop a file on it, pick
 * one with the button, or paste a URL. Upload goes to `endpoint`, which stores
 * it in Supabase Storage and hands back a public URL.
 */
export default function ImageDropzone({
  label,
  value,
  onChange,
  endpoint,
  previewClassName = 'h-24 w-24',
  previewAlt,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  // dragenter/dragleave fire for every child too, so a plain boolean flickers
  // as the pointer crosses the preview or the button. Counting depth doesn't.
  const dragDepth = useRef(0)
  // setUploading is async, so two files landing in the same tick would both see
  // uploading === false, both upload, and race to set the image. A ref settles
  // it synchronously; the state is still what the UI renders from.
  const uploadingRef = useRef(false)

  const uploadFile = async (file: File) => {
    if (uploadingRef.current) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Unsupported file type. Use JPG, PNG, WebP or GIF.')
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError('File too large (max 5 MB)')
      return
    }
    setUploadError(null)
    uploadingRef.current = true
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch(endpoint, { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setUploadError(data.error || 'Upload failed')
        return
      }
      onChange(data.url)
    } catch {
      // Without this the spinner would spin for good on a dropped connection.
      setUploadError('Upload failed — check your connection and try again.')
    } finally {
      uploadingRef.current = false
      setUploading(false)
    }
  }

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same file be re-selected later
    if (file) uploadFile(file)
  }

  // Only files are droppable here; a row-reorder drag carries text/plain and is
  // left alone so it can't be mistaken for an upload.
  const hasFiles = (e: React.DragEvent) => e.dataTransfer.types.includes('Files')

  const onDragEnter = (e: React.DragEvent) => {
    if (uploading || !hasFiles(e)) return
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
    if (uploading || !hasFiles(e)) return
    e.preventDefault() // without this, onDrop never fires
    e.dataTransfer.dropEffect = 'copy'
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  // A drop that misses the zone would otherwise make the browser navigate to
  // the file, losing everything typed into the form around it. Swallow the
  // strays, and clear the highlight for a drag that ends outside the zone —
  // that fires no dragleave on it, so the border would stay lit. Narrowed to
  // file drags so it can't swallow a reorder drag that shares the page.
  useEffect(() => {
    const swallow = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) e.preventDefault()
    }
    const clear = () => {
      dragDepth.current = 0
      setDragging(false)
    }
    window.addEventListener('dragover', swallow)
    window.addEventListener('drop', swallow)
    window.addEventListener('drop', clear)
    window.addEventListener('dragend', clear)
    return () => {
      window.removeEventListener('dragover', swallow)
      window.removeEventListener('drop', swallow)
      window.removeEventListener('drop', clear)
      window.removeEventListener('dragend', clear)
    }
  }, [])

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`flex items-start gap-4 rounded-lg border border-dashed p-4 transition-colors ${
          dragging ? 'border-accent bg-accent/5' : 'border-border'
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={previewAlt}
            className={`${previewClassName} shrink-0 rounded-lg border border-border object-cover bg-surface`}
          />
        ) : (
          <div
            className={`${previewClassName} flex shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text-muted`}
          >
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <label
            className={`btn btn-secondary inline-flex ${uploading ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Uploading…' : 'Upload image'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handlePick}
              disabled={uploading}
            />
          </label>
          {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
          <input
            className={field}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL / path"
          />
          <p className="text-xs text-text-muted">
            {dragging
              ? 'Drop the image to upload it.'
              : 'Drag an image here, or use the button above. JPG, PNG, WebP or GIF, up to 5 MB. Uploads are stored in Supabase Storage.'}
          </p>
        </div>
      </div>
    </div>
  )
}
