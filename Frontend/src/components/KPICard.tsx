

export default function KPICard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 backdrop-blur">
      <div className="text-sm text-slate-300">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  )
}
