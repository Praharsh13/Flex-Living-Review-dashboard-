

type Point = { i: number; avg: number }
export default function TrendSparkline({ points }: { points: Point[] }) {
  if (!points.length) return <div className="text-xs text-slate-400">No trend</div>
  const w = 160, h = 40, pad = 4
  const xs = points.map(p => p.i)
  const ys = points.map(p => p.avg)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const scaleX = (x: number) => pad + (w - pad * 2) * (maxX === minX ? 0.5 : (x - minX) / (maxX - minX))
  const scaleY = (y: number) => h - pad - (h - pad * 2) * (maxY === minY ? 0.5 : (y - minY) / (maxY - minY))
  const d = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.i).toFixed(1)} ${scaleY(p.avg).toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} aria-label="Trend">
      <path d={d} fill="none" stroke="#93c5fd" strokeWidth="2" />
    </svg>
  )
}
