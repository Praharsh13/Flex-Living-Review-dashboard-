import React from 'react'
import type { Review } from '../types'

export default function ReviewsDrawer({
  open, title, rows, onClose, onToggle
}: {
  open: boolean
  title: string
  rows: Review[]
  onClose: () => void
  onToggle: (id: string) => void
}) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      {/* overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} />

      {/* panel */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-2xl transform bg-slate-900/95 backdrop-blur
                       transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-slate-700 p-4">
          <div>
            <div className="text-xs text-slate-400">Property</div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-slate-600 px-3 py-1.5 text-slate-100 hover:bg-slate-700">
            Close
          </button>
        </div>

        <div className="h-[calc(100%-64px)] overflow-y-auto p-4">
          {rows.length === 0 && <div className="text-slate-300">No reviews for this property.</div>}

          <table className="w-full text-sm text-slate-100">
            <thead className="text-left text-slate-300">
              <tr>
                <th className="p-2">Approved</th>
                <th className="p-2">Guest</th>
                <th className="p-2">Rating</th>
                <th className="p-2">Date</th>
                <th className="p-2">Comment</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={`${r.channel}:${r.id}`} className="border-t border-slate-800">
                  <td className="p-2">
                    <input type="checkbox" checked={!!r.approved} onChange={() => onToggle(r.id)} />
                  </td>
                  <td className="p-2">{r.guest}</td>
                  <td className="p-2">{r.rating ?? '—'}</td>
                  <td className="p-2">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}</td>
                  <td className="p-2 text-slate-200">{r.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
