import type { Review, Filters } from './types'

export function filterRows(rows: Review[], f: Filters): Review[] {
  const from = f.from ? new Date(f.from) : null
  const to   = f.to   ? new Date(f.to)   : null
  const q    = (f.search || '').toLowerCase()

  return rows.filter(r => {
    if (f.listing && r.listing !== f.listing) return false
    if (f.channel && r.channel !== f.channel) return false
    if (f.minRating && (r.rating ?? 0) < f.minRating) return false

    if (from && r.submittedAt && new Date(r.submittedAt) < from) return false
    if (to   && r.submittedAt && new Date(r.submittedAt) > to)   return false

    if (f.category) {
      const has = (r.categories || []).some(c => c.key === f.category)
      if (!has) return false
    }

    if (q) {
      const hay = `${r.comment || ''} ${r.guest || ''} ${r.listing || ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }

    return true
  })
}

export function sortRows(rows: Review[], sortBy: 'date'|'rating', dir: 'asc'|'desc'): Review[] {
  const s = [...rows]
  const mul = dir === 'asc' ? 1 : -1

  if (sortBy === 'rating') {
    s.sort((a,b) => ((a.rating ?? -Infinity) - (b.rating ?? -Infinity)) * mul)
  } else {
    s.sort((a,b) => {
      const at = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
      const bt = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
      return (at - bt) * mul
    })
  }
  return s
}

export function groupByListing(rows: Review[]): Record<string, Review[]> {
  const out: Record<string, Review[]> = {}
  for (const r of rows) {
    if (!out[r.listing]) out[r.listing] = []
    out[r.listing].push(r)
  }
  return out
}

export function aggregates(reviews: Review[]) {
  const nums = reviews.map(r => r.rating).filter((v): v is number => typeof v === 'number')
  const avg  = nums.length ? +(nums.reduce((a,b)=>a+b,0) / nums.length).toFixed(1) : null

  const sum: Record<string, number> = {}
  const cnt: Record<string, number> = {}
  for (const r of reviews) {
    for (const c of r.categories || []) {
      if (typeof c.rating !== 'number') continue
      sum[c.key] = (sum[c.key] || 0) + c.rating
      cnt[c.key] = (cnt[c.key] || 0) + 1
    }
  }
  const categories = Object.keys(sum).map(k => ({ key: k, avg: +(sum[k] / cnt[k]).toFixed(1) }))
  return { count: reviews.length, avgRating: avg, categories }
}

export function issuesBelow(reviews: Review[], threshold = 7) {
  return aggregates(reviews).categories.filter(c => c.avg < threshold)
}
