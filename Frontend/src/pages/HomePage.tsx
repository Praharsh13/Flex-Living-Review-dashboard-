import  { useEffect, useMemo, useState } from 'react'
import { fetchReviews } from '../lib/api'
import type { ReviewsPayload, Review } from '../types'
import PublicPropertyCard from '../components/PublicPropertyCard'
import { aggregates } from '../util'

type SortKey = 'rating' | 'reviews' | 'name'

export default function HomePublic() {
  const [payload, setPayload] = useState<ReviewsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('rating')

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const data = await fetchReviews()
        setPayload(data)
      } catch {
        setError('Could not load properties right now.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Prefer backend grouping; if not present, group locally from result
  const grouped: Record<string, Review[]> = useMemo(() => {
    if (!payload) return {}
    const g = (payload as any).groupedByListing || {}
    if (g && Object.keys(g).length > 0) return g
    const out: Record<string, Review[]> = {}
    for (const r of payload.result) (out[r.listing] ||= []).push(r)
    return out
  }, [payload])

  // Build entries with aggregates for sorting
  const entries = useMemo(() => {
    const base = Object.entries(grouped)
      .map(([name, rows]) => {
        const approved = rows.filter(r => (r as any)?.approved === true || (r as any)?.status === 'approved')
        const agg = aggregates(rows) // avgRating (0–10), count, categories
        return { name, rows, approved, agg }
      })
      .filter(e => e.name.toLowerCase().includes(query.toLowerCase()))

    const byRating = (a: typeof base[number], b: typeof base[number]) =>
      (b.agg.avgRating ?? 0) - (a.agg.avgRating ?? 0) || b.approved.length - a.approved.length || a.name.localeCompare(b.name)

    const byReviews = (a: typeof base[number], b: typeof base[number]) =>
      b.approved.length - a.approved.length || (b.agg.avgRating ?? 0) - (a.agg.avgRating ?? 0) || a.name.localeCompare(b.name)

    const byName = (a: typeof base[number], b: typeof base[number]) => a.name.localeCompare(b.name)

    const sorted =
      sortBy === 'rating' ? [...base].sort(byRating)
      : sortBy === 'reviews' ? [...base].sort(byReviews)
      : [...base].sort(byName)

    return sorted
  }, [grouped, query, sortBy])

  if (loading) {
    return (
      <div className="space-y-6">
        <Hero query={query} setQuery={setQuery} sortBy={sortBy} setSortBy={setSortBy} loading />
        <SkeletonGrid />
      </div>
    )
  }

  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <Hero query={query} setQuery={setQuery} sortBy={sortBy} setSortBy={setSortBy} />

      {entries.length === 0 ? (
        <div className="rounded-2xl border bg-white/70 p-6 text-gray-600">
          No properties found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(({ name, rows, approved }) => (
            <PublicPropertyCard
              key={name}
              name={name}
              all={rows}
              approved={approved}
            />
          ))}
        </div>
      )}
    </div>
  )
}



function Hero({
  query,
  setQuery,
  sortBy,
  setSortBy,
  loading = false,
}: {
  query: string
  setQuery: (v: string) => void
  sortBy: SortKey
  setSortBy: (s: SortKey) => void
  loading?: boolean
}) {
  // Subtle “architecture grid” pattern overlay (SVG) + gradient
  const pattern =
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'>
        <g fill='none' stroke='#CBD5E1' stroke-width='0.5' opacity='0.5'>
          <rect x='0' y='0' width='160' height='160'/>
          <path d='M0 40h160M0 80h160M0 120h160M40 0v160M80 0v160M120 0v160'/>
        </g>
      </svg>`
    )

  return (
    <section
      className="
        overflow-hidden rounded-2xl border
        bg-gradient-to-br from-indigo-50 via-white to-emerald-50 relative
      "
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(238,242,255,0.8), rgba(240,253,244,0.8)), url("data:image/svg+xml,${pattern}")`,
        backgroundSize: 'cover, 160px 160px',
        backgroundPosition: 'center',
      }}
    >
      <div className="p-6 md:p-7 lg:p-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Flex Living — Book Beautiful Stays
          </h1>
          <p className="text-gray-600">
          Furnished apartments in <span className="font-medium">top</span> locations.
          </p>
        </div>

        <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {/* Search */}
          <label className="relative w-full sm:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {/* search icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </span>
            <input
              className="w-full rounded-lg border px-9 py-2 text-sm bg-white/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Search property…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              disabled={loading}
            />
          </label>

          {/* Sort */}
          <label className="relative w-full sm:w-56">
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortKey)}
              disabled={loading}
            >
              <option value="rating">Sort: Highest Rating</option>
              <option value="reviews">Sort: Most Reviews</option>
              <option value="name">Sort: A–Z</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  )
}

/* ---------- Skeleton state ---------- */

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border bg-white/70 shadow-sm">
          <div className="h-40 w-full bg-gray-100" />
          <div className="p-4 space-y-3">
            <div className="h-5 w-2/3 bg-gray-100 rounded" />
            <div className="h-4 w-1/3 bg-gray-100 rounded" />
            <div className="h-9 w-28 bg-gray-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
