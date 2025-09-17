import  { useId, useMemo } from 'react'
import type { Review } from '../types'
import { aggregates } from '../util'
import {
  PROPERTY_META,
  FALLBACK_IMAGE,
  FALLBACK_TYPE,
  type PropertyMeta
} from '../data/propertyMeta'
import { Link } from 'react-router-dom'

type Props = {
  name: string
  all: Review[]
  approved: Review[]
}

function prettyCat(s: string) {
  return s.replace(/_/g, ' ')
}

function toDate(v?: string | Date | null): Date | null {
  if (!v) return null
  return v instanceof Date ? v : new Date(v)
}

function prettyDate(v?: string | Date | null) {
  const d = toDate(v)
  return d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
}

/** Map category → pastel gradient chip (feel free to extend) */
const catColors: Record<string, string> = {
  cleanliness: 'from-emerald-100 to-emerald-200 text-emerald-900',
  service:     'from-sky-100 to-sky-200 text-sky-900',
  location:    'from-violet-100 to-violet-200 text-violet-900',
  value:       'from-rose-100 to-rose-200 text-rose-900',
  amenities:   'from-amber-100 to-amber-200 text-amber-900',
  default:     'from-gray-100 to-gray-200 text-gray-900',
}
function categoryClass(key: string) {
  return catColors[key.toLowerCase()] || catColors.default
}

/** Half-star with unique gradient ids */
function StarRating({ value = 0, size = 14, className = '' }: { value?: number; size?: number; className?: string }) {
  const uid = useId()
  const v = Math.max(0, Math.min(5, Number(value) || 0))
  const full = Math.floor(v)
  const half = v - full >= 0.5
  const total = 5
  return (
    <div className={`inline-flex items-center gap-1 ${className}`} aria-label={`Rating ${v} out of 5`}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < full
        const isHalf = i === full && half
        const gradId = `${uid}-half-${i}`
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
            {isHalf && (
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
            )}
            <path
              d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
              fill={filled ? 'currentColor' : isHalf ? `url(#${gradId})` : 'currentColor'}
              className={filled || isHalf ? '' : 'opacity-30'}
              stroke={isHalf ? 'currentColor' : undefined}
              strokeWidth={isHalf ? 1 : undefined}
            />
          </svg>
        )
      })}
    </div>
  )
}

export default function PublicPropertyCard({ name, all, approved }: Props) {
  const meta: PropertyMeta | undefined = PROPERTY_META[name]
  const img = meta?.image || FALLBACK_IMAGE
  const type = meta?.type || FALLBACK_TYPE

  const aggAll = aggregates(all) // { avgRating(0-10), count, categories: [{key, avg}] }
  const fiveStarAvg = aggAll?.avgRating ? Math.round(((aggAll.avgRating / 10) * 5) * 2) / 2 : 0

  const topCats = useMemo(
    () => [...(aggAll.categories || [])].sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0)).slice(0, 3),
    [aggAll.categories]
  )

  // Exactly ONE approved review in preview
  const preview = useMemo(() => {
    const sorted = [...approved].sort((a, b) => {
      const at = toDate(a.submittedAt)?.getTime() ?? 0
      const bt = toDate(b.submittedAt)?.getTime() ?? 0
      return bt - at
    })
    return sorted.slice(0, 1)
  }, [approved])

  return (
    <section
      className="
        group relative flex flex-col overflow-hidden rounded-2xl border
        bg-gradient-to-br from-indigo-50 via-white to-purple-50
        shadow-sm transition-all hover:shadow-md focus-within:shadow-md
      "
    >
      
      <div className="flex flex-col h-full backdrop-blur-[2px] bg-white/70">
        
        <div className="relative h-48 w-full">
          <img
            src={img}
            alt={`${name} cover`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

          {/* Type */}
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800 backdrop-blur border">
              {type}
            </span>
          </div>

          {/*For stars */}
          <div className="absolute right-4 bottom-4 flex items-center gap-2 rounded-lg border bg-white/95 px-2.5 py-1.5 text-xs font-medium text-gray-700 backdrop-blur">
            <span className="hidden sm:inline">Avg (all):</span>
            <span className="font-semibold text-indigo-600">{aggAll.avgRating ?? '—'}</span>
            <span className="mx-1 h-4 w-px bg-gray-200" />
            <StarRating value={fiveStarAvg} className="text-amber-500" />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5 md:p-6">
          {/* Title & counts */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight line-clamp-2">
              {name}
            </h3>
            <div className="text-right text-xs text-gray-700">
              {/* <div className="rounded-md border px-2 py-1 bg-white/70">
                <span className="font-medium text-gray-900">{aggAll.count}</span> Total
              </div> */}
              <div className="mt-1 text-[11px]">
                <p className="font-medium text-gray-900">{approved.length}</p> Reviews
              </div>
            </div>
          </div>

          
          {topCats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topCats.map((c) => (
                <span
                  key={c.key}
                  className={`
                    rounded-full bg-gradient-to-r ${categoryClass(c.key)}
                    px-2.5 py-1 text-xs font-medium shadow-sm
                    ring-1 ring-black/5
                  `}
                  title={`${prettyCat(c.key)}: ${c.avg}/10`}
                >
                  {prettyCat(c.key)} • {c.avg}
                </span>
              ))}
            </div>
          )}

         
          

<div className="mt-1 rounded-xl border 
                bg-gradient-to-br from-slate-50 via-white to-slate-100 
                dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 
                p-4 shadow-sm">
  <div className="mb-3 flex items-center justify-between">
    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">Top Review</div>
    {approved.length > 0 && (
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Showing 1 of {approved.length}
      </div>
    )}
  </div>

  {approved.length === 0 ? (
    <div className="text-sm text-gray-700 dark:text-gray-300">No reviews yet.</div>
  ) : (
    <ul className="divide-y divide-gray-200/70 dark:divide-gray-700/60">
      {preview.map((r) => (
        <li key={`${r.channel}:${r.id}`} className="py-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {r.guest ?? 'Guest'}
                </span>
                {r.submittedAt && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {prettyDate(r.submittedAt)}
                  </span>
                )}
              </div>

              {r.comment && (
                <p className="mt-1.5 text-[15px] leading-7 text-gray-900 dark:text-gray-100 line-clamp-3">
                  {r.comment}
                </p>
              )}

              {(r.categories || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.categories.map((c) => (
                    <span
                      key={c.key}
                      className={`
                        rounded-full bg-gradient-to-r ${categoryClass(c.key)}
                        px-2 py-0.5 text-[11px] font-medium shadow-sm ring-1 ring-black/5
                      `}
                      title={`${prettyCat(c.key)}: ${c.rating ?? '—'}/10`}
                    >
                      {prettyCat(c.key)} • {c.rating ?? '—'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>


          {/* Footer */}
          <div className="flex justify-end">
            <Link
              to={`/property/${encodeURIComponent(name)}`}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-gray-800 transition-all hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              View Details
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                <path d="M13 5l7 7-7 7M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
