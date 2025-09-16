import React from 'react'

type Props = {
  page: number
  pageSize: number
  total: number
  onPageChange: (next: number) => void
}

export default function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages
  const start = (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)

  return (
    <div className="flex items-center justify-between p-3 text-sm text-slate-200">
      <div className="text-slate-400">
        Showing <span className="text-slate-100">{start}</span>–<span className="text-slate-100">{end}</span> of <span className="text-slate-100">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          className="h-9 rounded-lg border border-slate-600 bg-slate-700 px-3 text-slate-100 disabled:opacity-40"
        >
          Prev
        </button>
        <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
          Page <span className="font-semibold">{page}</span> / {totalPages}
        </div>
        <button
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          className="h-9 rounded-lg border border-slate-600 bg-slate-700 px-3 text-slate-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
