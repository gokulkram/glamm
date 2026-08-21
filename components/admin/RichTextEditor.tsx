'use client'

import { useCallback, useRef, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import {
  Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered,
  Quote, Link2, Link2Off, ImagePlus, Undo2, Redo2, Loader2,
} from 'lucide-react'

// Same limits as app/api/admin/blog/upload/route.ts, so a bad file fails here
// rather than after the round trip.
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

type Props = {
  value: string
  onChange: (html: string) => void
  /**
   * Upload route for images dropped or picked inside the body. Omit it where
   * inline images don't belong — the image button and the drop target go with
   * it, rather than offering an upload that has nowhere to go.
   */
  uploadEndpoint?: string
  /**
   * Stylesheet class the body is rendered with on the public site, applied to
   * the editing surface too so authoring shows the published look.
   */
  contentClass?: string
  /** Rows-worth of minimum height, as a Tailwind class. */
  minHeightClass?: string
}

function ToolbarButton({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors disabled:opacity-40 ${
        active
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-transparent text-text-muted hover:bg-surface hover:text-text'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({
  editor, onPickImage, uploading, allowImages,
}: {
  editor: Editor
  onPickImage: () => void
  uploading: boolean
  allowImages: boolean
}) {
  // The link prompt is the one place a browser dialog is unavoidable without
  // building a popover; window.prompt keeps it to one line and is dismissible.
  const setLink = useCallback(() => {
    const previous = editor.getAttributes('link').href ?? ''
    const url = window.prompt('Link URL', previous)
    if (url === null) return // cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const sep = <span className="mx-1 h-5 w-px bg-border" />

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-white px-2 py-1.5">
      <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></ToolbarButton>
      <ToolbarButton title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></ToolbarButton>
      {sep}
      <ToolbarButton title="Heading" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></ToolbarButton>
      <ToolbarButton title="Subheading" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></ToolbarButton>
      {sep}
      <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></ToolbarButton>
      <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></ToolbarButton>
      <ToolbarButton title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></ToolbarButton>
      {sep}
      <ToolbarButton title="Add link" active={editor.isActive('link')} onClick={setLink}><Link2 className="h-4 w-4" /></ToolbarButton>
      <ToolbarButton title="Remove link" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}><Link2Off className="h-4 w-4" /></ToolbarButton>
      {allowImages && (
        <ToolbarButton title="Insert image" disabled={uploading} onClick={onPickImage}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        </ToolbarButton>
      )}
      {sep}
      <ToolbarButton title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 className="h-4 w-4" /></ToolbarButton>
      <ToolbarButton title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 className="h-4 w-4" /></ToolbarButton>
    </div>
  )
}

/**
 * Rich-text editor for blog post bodies. Emits HTML, which the server
 * sanitises on write and again on render (lib/richText.ts) — nothing here is
 * trusted just because it came from the toolbar.
 *
 * `.blog-content` is the same class the public post page uses, so what the
 * editor shows is styled by the stylesheet that will render it.
 */
export default function RichTextEditor({
  value,
  onChange,
  uploadEndpoint,
  contentClass = 'blog-content',
  minHeightClass = 'min-h-[22rem]',
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const uploadingRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }, // h1 belongs to the post title, not the body
        link: false, // configured separately below
      }),
      Link.configure({ openOnClick: false, autolink: false }),
      Image.configure({ inline: false }),
    ],
    content: value,
    // Next.js renders this on the server first; without it TipTap warns about a
    // hydration mismatch on mount.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `${contentClass} ${minHeightClass} px-4 py-3 outline-none`,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  const uploadImage = useCallback(
    async (file: File) => {
      if (uploadingRef.current || !editor || !uploadEndpoint) return
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
        const res = await fetch(uploadEndpoint, { method: 'POST', body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setUploadError(data.error || 'Upload failed')
          return
        }
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run()
      } catch {
        setUploadError('Upload failed — check your connection and try again.')
      } finally {
        uploadingRef.current = false
        setUploading(false)
      }
    },
    [editor, uploadEndpoint],
  )

  if (!editor) {
    return <div className="rounded-lg border border-border bg-white h-[26rem] animate-pulse" />
  }

  return (
    <div>
      <div className="rounded-lg border border-border bg-white overflow-hidden focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
        <Toolbar
          editor={editor}
          uploading={uploading}
          allowImages={Boolean(uploadEndpoint)}
          onPickImage={() => fileInput.current?.click()}
        />
        <div
          onDrop={(e) => {
            if (!uploadEndpoint) return
            const file = e.dataTransfer.files?.[0]
            if (!file) return // a text drag — let the editor handle it itself
            e.preventDefault()
            uploadImage(file)
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = '' // let the same file be picked again
          if (file) uploadImage(file)
        }}
      />
      {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
      <p className="text-xs text-text-muted mt-2">
        {uploadEndpoint
          ? 'Drag an image into the body to upload it, or use the image button. Links open in a new tab when they point off-site.'
          : 'Links open in a new tab when they point off-site.'}
      </p>
    </div>
  )
}
