import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom'
import type { Review, ReviewsPayload } from '../types'
import { fetchReviews, toggleAproval } from '../lib/api'
import { isLoggedIn } from '../auth'

function toDate(v?: string | Date | null): Date | null {
  if (!v) return null
  return v instanceof Date ? v : new Date(v)
}
function prettyDate(v?: string | Date | null) {
  const d = toDate(v)
  return d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

export default function ReviewDetails() {
  const loggedIn = isLoggedIn()
  const nav = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation() as any
  const fromState: Review | undefined = location?.state?.review

  const [payload, setPayload] = useState<ReviewsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    if (!loggedIn) return
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)
        if (!fromState) {
          const data = await fetchReviews()
          setPayload(data)
        }
      } catch {
        setErr('Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [loggedIn, fromState])

  const review: Review | undefined = useMemo(() => {
    if (fromState) return fromState
    const all = payload?.result || []
    return all.find(r => String(r.id) === String(id))
  }, [fromState, payload, id])

  async function handleToggle() {
    if (!review) return
    try {
      setToggling(true)
      await toggleAproval(review.id)
      const data = await fetchReviews()
      const updated = data.result.find(r => String(r.id) === String(id))
      if (updated) nav('.', { replace: true, state: { review: updated } })
    } finally {
      setToggling(false)
    }
  }

  if (!loggedIn) return <Navigate to="/login" replace />

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-[#0b1224] relative">
      <BackgroundFX />

      <div className="w-full px-4 sm:px-6 py-6 md:py-8 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          {/* Back */}
          <button
            onClick={() => nav(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/90 px-3 py-2 text-sm text-slate-100 hover:bg-slate-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          {/* Content states */}
          {loading && (
            <div className="rounded-2xl backdrop-blur bg-slate-800/60 ring-1 ring-white/10 p-6 text-slate-300">
              Loading…
            </div>
          )}
          {err && (
            <div className="rounded-2xl backdrop-blur bg-slate-800/60 ring-1 ring-white/10 p-6 text-red-400">
              {err}
            </div>
          )}
          {!loading && !err && !review && (
            <div className="rounded-2xl backdrop-blur bg-slate-800/60 ring-1 ring-white/10 p-6 text-slate-300">
              Review not found.
            </div>
          )}

          {review && (
            <div className="rounded-2xl backdrop-blur bg-slate-800/60 ring-1 ring-white/10 shadow-lg shadow-black/20 p-6">
              {/* Header */}
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs text-slate-400">Listing</div>
                  <h1 className="text-xl md:text-2xl font-semibold text-white leading-tight">
                    {review.listing}
                  </h1>
                </div>
                <div className="text-xs text-slate-300">
                  <div>Channel: <span className="text-slate-100 font-medium capitalize">{review.channel}</span></div>
                  <div>Status: <span className="text-slate-100 font-medium">{review.status}</span></div>
                </div>
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                  <div className="text-xs text-slate-400">Guest</div>
                  <div className="text-base font-medium text-white truncate">{review.guest || '—'}</div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                  <div className="text-xs text-slate-400">Rating</div>
                  <div className="text-2xl font-semibold text-white">{review.rating ?? '—'}</div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                  <div className="text-xs text-slate-400">Date</div>
                  <div className="text-base font-medium text-white">
                    {prettyDate(review.submittedAt)}
                  </div>
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <div className="mt-6">
                  <div className="text-sm font-semibold text-slate-200 mb-1">Comment</div>
                  <p className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 text-slate-100 leading-7">
                    {review.comment}
                  </p>
                </div>
              )}

              {/* Categories */}
              {(review.categories || []).length > 0 && (
                <div className="mt-6">
                  <div className="text-sm font-semibold text-slate-200 mb-2">Categories</div>
                  <div className="flex flex-wrap gap-2">
                    {review.categories.map(c => (
                      <span
                        key={c.key}
                        className="rounded-full border border-slate-600 bg-slate-900/60 px-3 py-1 text-xs text-slate-100"
                        title={`${c.key.replace(/_/g,' ')}: ${c.rating ?? '—'}/10`}
                      >
                        {c.key.replace(/_/g,' ')} • {c.rating ?? '—'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval */}
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-slate-300">
                  Approved for public site:{' '}
                  <span className={`font-semibold ${review.approved ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {review.approved ? 'Yes' : 'No'}
                  </span>
                </div>
                <button
                  onClick={handleToggle}
                  disabled={toggling}
                  className="
                    inline-flex items-center gap-2 rounded-lg border border-slate-600
                    bg-slate-700/90 px-4 py-2 text-sm text-slate-100
                    hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  {toggling ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.3"/>
                        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" fill="none"/>
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      {review.approved ? 'Unapprove' : 'Approve'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* Fixed, full-viewport background (matches dashboard aesthetic) */
function BackgroundFX() {
  const grid = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'>
      <g fill='none' stroke='#2a395a' stroke-width='0.6' opacity='0.35'>
        <rect x='0' y='0' width='160' height='160'/>
        <path d='M0 40h160M0 80h160M0 120h160M40 0v160M80 0v160M120 0v160'/>
      </g>
    </svg>`
  )
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 bg-[#0b1224]"
      style={{
        backgroundImage: `
          radial-gradient(800px 400px at 10% -10%, rgba(99,102,241,0.25), transparent 60%),
          radial-gradient(600px 300px at 90% 0%, rgba(16,185,129,0.18), transparent 60%),
          url("data:image/svg+xml,${grid}")
        `,
        backgroundSize: 'auto, auto, 160px 160px',
        backgroundRepeat: 'no-repeat, no-repeat, repeat',
        backgroundPosition: 'top left, top right, center',
      }}
    />
  )
}
