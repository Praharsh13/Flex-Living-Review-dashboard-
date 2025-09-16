
import { Link } from 'react-router-dom'
import TrendSparkline from './TrendSparkline'

type Issue = { key: string; avg: number }
type Trend = { points: { i: number; month: string; avg: number }[]; slope: number }

export default function PropertyInsightsCard(props: {
  name: string
  avg: number | null
  count: number
  approvedCount: number
  issues: Issue[]
  trend: Trend
  onOpen: () => void
}) {
  const { name, avg, count, approvedCount, issues, trend, onOpen } = props
  const slopeBadge =
    trend.slope > 0 ? <span className="text-emerald-400">+{trend.slope}</span> :
    trend.slope < 0 ? <span className="text-rose-400">{trend.slope}</span> :
    <span className="text-slate-300">0.0</span>

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 backdrop-blur">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-300">Listing</div>
          <h3 className="text-lg font-semibold text-white">{name}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpen}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-slate-100 hover:bg-slate-600"
          >
            Reviews
          </button>
          <Link
            to={`/property/${encodeURIComponent(name)}`}
            className="rounded-lg border border-indigo-500 bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500 transition-colors"
          >
            View
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-xs text-slate-400">Avg rating</div>
          <div className="text-xl font-semibold text-white">{avg ?? '—'}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Reviews</div>
          <div className="text-xl font-semibold text-white">{count}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Approved</div>
          <div className="text-xl font-semibold text-white">{approvedCount}</div>
        </div>
      </div>

      {/* Trend */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-slate-400">Trend (monthly avg)</div>
        <div className="text-xs">{slopeBadge}</div>
      </div>
      <div className="mt-2">
        <TrendSparkline points={trend.points} />
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-slate-400 mb-1">Recurring issues</div>
          <div className="flex flex-wrap gap-2">
            {issues.slice(0, 4).map(c => (
              <span
                key={c.key}
                className="rounded-full border border-rose-400/40 bg-rose-400/10 px-2 py-0.5 text-[11px] text-rose-300"
              >
                {c.key.replace(/_/g, ' ')} • {c.avg}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
