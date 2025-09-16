import React, { useMemo } from 'react'
import type { Review } from '../types'

type Props = {
  rows: Review[]                 // pass filtered rows (e.g., `sorted` from Dashboard)
  title?: string
  limit?: number                 // optionally limit how many categories to show
  sort?: 'desc' | 'asc'          // sort by highest/lowest average
}

type CatAgg = { key: string; avg: number; count: number }

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
function prettyCat(s: string) {
  return s.replace(/_/g, ' ')
}

export default function CategoryKPIs({
  rows,
  title = 'Category Performance (All Properties)',
  limit,
  sort = 'desc'
}: Props) {
  const categories: CatAgg[] = useMemo(() => {
    const sum: Record<string, number> = {}
    const count: Record<string, number> = {}

    for (const r of rows) {
      for (const c of r.categories || []) {
        if (typeof c.rating !== 'number') continue
        const key = (c.key || '').trim()
        if (!key) continue
        sum[key] = (sum[key] ?? 0) + c.rating
        count[key] = (count[key] ?? 0) + 1
      }
    }

    let list = Object.keys(sum).map((k) => ({
      key: k,
      avg: +(sum[k] / count[k]).toFixed(2),
      count: count[k],
    }))

    list.sort((a, b) =>
      sort === 'desc'
        ? (b.avg - a.avg) || (b.count - a.count) || a.key.localeCompare(b.key)
        : (a.avg - b.avg) || (b.count - a.count) || a.key.localeCompare(b.key)
    )

    if (limit && limit > 0) list = list.slice(0, limit)
    return list
  }, [rows, limit, sort])

  if (categories.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((c) => (
          <div
            key={c.key}
            className="
              rounded-2xl backdrop-blur bg-slate-800/60 ring-1 ring-white/10
              shadow-lg shadow-black/20 p-4 flex items-center justify-between
            "
            title={`${prettyCat(c.key)} • ${c.avg} / 10 (${c.count} ratings)`}
          >
            <div className="min-w-0">
              <div className="text-sm text-slate-300">{prettyCat(c.key)}</div>
              <div className="mt-1 text-xs text-slate-400">{c.count} ratings</div>
            </div>

            <div
              className={`
                shrink-0 rounded-full bg-gradient-to-r ${categoryClass(c.key)}
                px-3 py-1 text-sm font-semibold ring-1 ring-black/5
              `}
              aria-label={`${prettyCat(c.key)} average ${c.avg} out of 10`}
            >
              {c.avg} / 10
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
