'use client'

import { useState } from 'react'
import { ALL_ROWS } from './Pagination'

/**
 * Client-side paging for an admin list, plus the props <Pagination> needs.
 *
 * Pass the rows *after* filtering — the page count and the "showing x of y"
 * count both describe what the admin can actually see.
 *
 *   const paging = usePagination(filtered)
 *   ...
 *   {paging.pageItems.map(...)}
 *   <Pagination {...paging.paginationProps} />
 */
export function usePagination<T>(items: T[], defaultPageSize = 10) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  // "All" is one page holding everything. The floor of 1 keeps an empty list
  // from dividing by zero.
  const rowsPerPage = pageSize === ALL_ROWS ? Math.max(items.length, 1) : pageSize
  const pageCount = Math.max(1, Math.ceil(items.length / rowsPerPage))
  const currentPage = Math.min(page, pageCount)
  const pageItems = items.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  /** Keep the row you were looking at on screen when the page size changes. */
  const changePageSize = (size: number) => {
    const firstIndex = (currentPage - 1) * rowsPerPage
    const nextRows = size === ALL_ROWS ? Math.max(items.length, 1) : size
    setPageSize(size)
    setPage(Math.floor(firstIndex / nextRows) + 1)
  }

  return {
    page: currentPage,
    setPage,
    pageSize,
    rowsPerPage,
    pageCount,
    pageItems,
    changePageSize,
    paginationProps: {
      page: currentPage,
      pageCount,
      total: items.length,
      pageSize,
      onPageChange: setPage,
      onPageSizeChange: changePageSize,
    },
  }
}
