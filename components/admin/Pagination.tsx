'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}: {
  page: number
  pageCount: number
  total: number
  pageSize: number
  onPageChange: (p: number) => void
}) {
  if (total === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  // compact page numbers around the current page
  const pages: number[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(pageCount, page + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border text-sm">
      <span className="text-text-muted">
        Showing <span className="font-medium text-text">{from}</span>–
        <span className="font-medium text-text">{to}</span> of{' '}
        <span className="font-medium text-text">{total}</span>
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-surface"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {start > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="h-8 min-w-8 px-2 rounded-lg border border-border hover:bg-surface">
              1
            </button>
            {start > 2 && <span className="px-1 text-text-muted">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-8 min-w-8 px-2 rounded-lg border ${
              p === page ? 'border-accent bg-accent text-white' : 'border-border hover:bg-surface'
            }`}
          >
            {p}
          </button>
        ))}

        {end < pageCount && (
          <>
            {end < pageCount - 1 && <span className="px-1 text-text-muted">…</span>}
            <button onClick={() => onPageChange(pageCount)} className="h-8 min-w-8 px-2 rounded-lg border border-border hover:bg-surface">
              {pageCount}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-surface"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
