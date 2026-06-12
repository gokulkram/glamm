'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Loader2, Search } from 'lucide-react'
import type { Product, Category } from '@/lib/data'
import Pagination from '@/components/admin/Pagination'

const PAGE_SIZE = 10

export default function ProductTable({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    })
  }, [products, search, category])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // reset to page 1 whenever filters change
  const resetAnd = (fn: () => void) => {
    fn()
    setPage(1)
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return
    setError(null)
    setDeletingId(product.id)
    const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Failed to delete product')
      setDeletingId(null)
      return
    }
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => resetAnd(() => setSearch(e.target.value))}
            placeholder="Search by name, slug, category…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <select
          value={category}
          onChange={(e) => resetAnd(() => setCategory(e.target.value))}
          className="px-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-accent sm:w-52"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                  No products match your filters.
                </td>
              </tr>
            )}
            {pageItems.map((p) => (
              <tr key={p.id} className="hover:bg-surface/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface">
                      {p.image && (
                        <Image src={p.image} alt={p.title} fill className="object-cover" unoptimized />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-text-muted">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted">{p.category}</td>
                <td className="px-4 py-3">
                  ${p.priceMin}
                  {p.priceMax !== p.priceMin && <span className="text-text-muted"> – ${p.priceMax}</span>}
                </td>
                <td className="px-4 py-3">
                  {p.inStock ? (
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      In stock
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      Out
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p.id}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      aria-label="Delete"
                    >
                      {deletingId === p.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        pageCount={pageCount}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  )
}
