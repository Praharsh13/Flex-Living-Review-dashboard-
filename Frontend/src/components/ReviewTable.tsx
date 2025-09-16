import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Review } from '../types'
import Pagination from './Pagination'

type Props = {
  rows: Review[]
  onToggle: (id: string) => void
  pageSize?: number
}

export default function ReviewTable({ rows, onToggle, pageSize = 20 }: Props) {
  const nav = useNavigate()
  const [page, setPage] = useState(1)

  const total = rows.length
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, page, pageSize])

  function openRow(r: Review) {
    nav(`/admin/review/${encodeURIComponent(r.id)}`, { state: { review: r } })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/80 text-slate-200">
            <tr className="text-left">
              <th className="p-3 font-medium">Approved</th>
              <th className="p-3 font-medium">Listing</th>
              <th className="p-3 font-medium">Channel</th>
              <th className="p-3 font-medium">Guest</th>
              <th className="p-3 font-medium">Rating</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Comment</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(r => (
              <tr
                key={`${r.channel}:${r.id}`}
                className="border-t border-slate-700/70 text-slate-100 hover:bg-slate-700/40 cursor-pointer"
                onClick={() => openRow(r)}
              >
                {/* stopPropagation on the checkbox so clicking it doesn't open the page */}
                <td className="p-3" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={!!r.approved}
                    onChange={() => onToggle(r.id)}
                  />
                </td>
                <td className="p-3">{r.listing}</td>
                <td className="p-3">{r.channel}</td>
                <td className="p-3">{r.guest}</td>
                <td className="p-3">{r.rating ?? '—'}</td>
                <td className="p-3">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}</td>
                <td className="p-3 text-slate-200 max-w-[520px] truncate" title={r.comment || ''}>
                  {r.comment}
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-300">No reviews match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  )
}
