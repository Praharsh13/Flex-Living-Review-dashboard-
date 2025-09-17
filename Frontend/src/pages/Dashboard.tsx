import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchReviews, toggleAproval } from '../lib/api'
import type { Filters, ReviewsPayload, Review } from '../types'
import FiltersBar from '../components/FiltersBar'
import KPICard from '../components/KPICard'
import PropertyInsightsCard from '../components/PropertyInsightsCard'
import ReviewsDrawer from '../components/ReviewsDrawer'
import { filterRows, sortRows, groupByListing } from '../util'
import { isLoggedIn } from '../auth'
import ReviewTable from '../components/ReviewTable'
import CategoryKPIs from '../components/CategoryKPI'

const initialFilters: Filters = {
  listing: '', channel: '', category: '',
  minRating: 0, from: '', to: '', search: '',
  sortBy: 'date', sortDir: 'desc',
}

/** Monthly trend with index i */
function buildTrendSeries(reviews: Review[]) {
    const buckets: Record<string, number[]> = {}
    for (const r of reviews) {
      if (!r.submittedAt || typeof r.rating !== 'number') continue
      const d = new Date(r.submittedAt as any)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      ;(buckets[key] ||= []).push(r.rating)
    }
    const months = Object.keys(buckets).sort()
    const points = months.map((m, i) => {
      const arr = buckets[m]
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length
      return { i, month: m, avg: +avg.toFixed(2) }
    })
    let slope = 0
    if (points.length >= 2) {
      slope = +(points[points.length - 1].avg - points[0].avg).toFixed(2)
    }
    return { points, slope }
  }

function recurringIssues(reviews: Review[], threshold = 7) {
  const sum: Record<string, number> = {}
  const count: Record<string, number> = {}
  for (const r of reviews) {
    for (const c of r.categories || []) {
      if (typeof c.rating !== 'number') continue
      sum[c.key] = (sum[c.key] || 0) + c.rating
      count[c.key] = (count[c.key] || 0) + 1
    }
  }
  return Object.keys(sum)
    .map(k => ({ key: k, avg: +(sum[k] / count[k]).toFixed(1) }))
    .filter(c => c.avg < threshold)
    .sort((a, b) => a.avg - b.avg)
}

export default function Dashboard() {
  const loggedIn = isLoggedIn()
  const [payload, setPayload] = useState<ReviewsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [error, setError] = useState<string | null>(null)
  const [drawer, setDrawer] = useState<{ open: boolean; property?: string }>({ open: false })

  useEffect(() => {
    if (!loggedIn) return
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchReviews()
        setPayload(data)
      } catch {
        setError('Failed to load reviews')
      } finally {
        setLoading(false)
      }
    })()
  }, [loggedIn])

  const all = payload?.result ?? []
  const listings = useMemo(() => Array.from(new Set(all.map(r => r.listing))).sort(), [all])
  const channels = useMemo(() => Array.from(new Set(all.map(r => r.channel))).sort(), [all])

  const filtered = useMemo(() => filterRows(all, filters), [all, filters])
  const sorted = useMemo(() => sortRows(filtered, filters.sortBy, filters.sortDir), [filtered, filters.sortBy, filters.sortDir])
  const grouped = useMemo(() => groupByListing(sorted), [sorted])

  const total = sorted.length
  const avg = total ? +(sorted.map(r => r.rating || 0).reduce((a, b) => a + b, 0) / total).toFixed(2) : null
  const approvals = useMemo(() => {
    const approved = sorted.filter(r => r.approved)
    return { approvedCount: approved.length, approvedShare: total ? Math.round((approved.length / total) * 100) : 0 }
  }, [sorted, total])

  async function handleToggle(id: string) {
    await toggleAproval(id)
    const data = await fetchReviews()
    setPayload(data)
  }

  if (!loggedIn) return <Navigate to="/login" replace />

  if (loading || error || !payload) {
    return (
      <div className="min-h-dvh w-full overflow-x-hidden bg-[#0b1224] relative">
        <BackgroundFX />
        <div className="w-full px-4 sm:px-6 py-12 flex flex-col items-center">
          <div className="w-full max-w-6xl">
            {loading && <div className="text-slate-300">Loading…</div>}
            {error && <div className="text-red-400">{error}</div>}
            {!loading && !error && !payload && <div className="text-slate-300">No data</div>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-[#0b1224] relative">
      <BackgroundFX />

      {/* Centered rail */}
      <div className="w-full px-4 sm:px-6 pt-8 pb-10 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <header className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-white">Properties Review Dashboard</h1>
              <p className="text-sm text-slate-300">Monitor quality, spot issues, and curate public reviews.</p>
            </div>
          </header>

         
          <div className="sticky top-0 z-20 mb-6">
            <div className="rounded-2xl backdrop-blur bg-slate-800/60 ring-1 ring-white/10 shadow-lg shadow-black/20">
              <div className="p-3 md:p-4">
                <FiltersBar values={filters} onChange={setFilters} listings={listings} channels={channels} />
              </div>
            </div>
          </div>

          {/* KPI row */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
  <div className="rounded-2xl backdrop-blur bg-slate-800/60 ring-1 ring-white/10 shadow-lg shadow-black/20">
    <KPICard label="Filtered Reviews" value={String(total)} hint="Matching current filters" />
  </div>
  <div className="rounded-2xl backdrop-blur bg-slate-800/60 ring-1 ring-white/10 shadow-lg shadow-black/20">
    <KPICard label="Average Rating" value={avg ?? '—'} hint="Across filtered reviews" />
  </div>
  <div className="rounded-2xl backdrop-blur bg-slate-800/60 ring-1 ring-white/10 shadow-lg shadow-black/20">
    <KPICard label="Approved Share" value={`${approvals.approvedShare}%`} hint={`${approvals.approvedCount} approved`} />
  </div>
</div>


<CategoryKPIs rows={sorted} />
<br></br>

          {/* Per-property performance */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Property-wise-Performance</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(grouped).map(([name, reviews]) => {
                const trend = buildTrendSeries(reviews)
                const issues = recurringIssues(reviews, 7)
                const approvedCount = reviews.filter(r => r.approved).length
                const propertyAvg = reviews.length
                  ? +(
                      reviews.map(r => r.rating || 0).reduce((a, b) => a + b, 0) / reviews.length
                    ).toFixed(1)
                  : null

                return (
                  <div key={name} className="rounded-2xl backdrop-blur bg-slate-800/60 ring-1 ring-white/10 shadow-lg shadow-black/20">
                    <PropertyInsightsCard
                      name={name}
                      avg={propertyAvg}
                      count={reviews.length}
                      approvedCount={approvedCount}
                      issues={issues}
                      trend={trend}
                      onOpen={() => setDrawer({ open: true, property: name })}
                    />
                  </div>
                )
              })}
            </div>
          </section>

          {/* Table: allow horizontal scroll, don’t push layout */}
          <section className="mt-10 space-y-3">
            <h2 className="text-lg font-semibold text-white">All Reviews</h2>
            <div className="rounded-2xl backdrop-blur bg-slate-800/60 ring-1 ring-white/10 shadow-lg shadow-black/20 overflow-x-auto">
              <ReviewTable rows={sorted} onToggle={handleToggle} />
            </div>
          </section>
        </div>
      </div>

      <ReviewsDrawer
        open={drawer.open}
        title={drawer.property || ''}
        rows={(drawer.property ? grouped[drawer.property] : []) || []}
        onClose={() => setDrawer({ open: false })}
        onToggle={handleToggle}
      />
    </div>
  )
}

/* Fixed, full-viewport background (won’t create horizontal scroll) */
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
