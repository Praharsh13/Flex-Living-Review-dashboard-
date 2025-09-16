import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchPublicReviews } from '../lib/api'
import type { ReviewsPayload, Review } from '../types'
import { aggregates } from '../util'
import { PROPERTY_META, FALLBACK_IMAGE, FALLBACK_TYPE, type PropertyMeta } from '../data/propertyMeta'

/* -------------------- small helpers -------------------- */

function toDate(v?: string | Date | null): Date | null {
  if (!v) return null
  return v instanceof Date ? v : new Date(v)
}
function prettyDate(v?: string | Date | null) {
  const d = toDate(v)
  return d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
}
function prettyCat(s: string) {
  return s.replace(/_/g, ' ')
}

/* pastel gradient chips for categories */
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

function StarRating10({ value }: { value: number | null }) {
  if (value == null) return <span>—</span>
  return (
    <span
      aria-label={`Rating ${value} out of 10`}
      title={`${value.toFixed(1)} / 10`}
      className="font-semibold text-indigo-600"
    >
      {value.toFixed(1)} / 10
    </span>
  )
}

/* -------------------- main page -------------------- */

export default function Property() {
  const { name } = useParams<{ name: string }>()
  const [payload, setPayload] = useState<ReviewsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'overview' | 'photos' | 'reviews' | 'highlights' | 'details'>('overview')

  const meta: PropertyMeta | undefined = PROPERTY_META[name ?? '']
  const images: string[] = meta?.images?.length ? meta.images : [meta?.image || FALLBACK_IMAGE]
  const type = meta?.type || FALLBACK_TYPE

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const data = await fetchPublicReviews() // approved-only from API
        setPayload(data)
      } catch (e) {
        setError('Could not load reviews right now.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const rows: Review[] = useMemo(() => {
    const all = payload?.result || [] // already approved
    return all.filter(r => r.listing === name)
  }, [payload, name])

  const stats = useMemo(() => aggregates(rows), [rows])

  if (loading) return <div className="rounded-2xl border bg-white/70 p-6">Loading…</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section
        className="
          overflow-hidden rounded-2xl border relative
          bg-gradient-to-br from-indigo-50 via-white to-emerald-50
        "
      >
        <div className="p-6 md:p-7 lg:p-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{name}</h1>
            <p className="text-gray-600">{type} • Guest reviews</p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6 bg-white/70 border rounded-xl px-4 py-3 backdrop-blur">
            <div className="text-right">
              <div className="text-sm text-gray-500">Average rating</div>
              <div className="text-xl">
                <StarRating10 value={stats.avgRating} />
              </div>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-right">
              <div className="text-sm text-gray-500">Total reviews</div>
              <div className="text-xl font-semibold">{stats.count}</div>
            </div>
          </div>
        </div>

        {/* Hero strip image */}
        <div className="h-48 md:h-56 w-full overflow-hidden">
          <img
            src={images[0] || FALLBACK_IMAGE}
            alt={`${name} cover`}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={e => { if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE }}
          />
        </div>
      </section>

      {/* Tabs */}
      <nav className="rounded-xl border bg-white/80 backdrop-blur px-2 py-2">
        <ul className="flex flex-wrap gap-2">
          {([
            ['overview', 'Overview'],
            ['photos', 'Photos'],
            ['reviews', 'Reviews'],
            ['highlights', 'Highlights'],
            ['details', 'Details'],
          ] as const).map(([key, label]) => (
            <li key={key}>
              <button
                onClick={() => setTab(key)}
                className={
                  `px-3.5 py-2 text-sm rounded-lg border transition-all ` +
                  (tab === key
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200')
                }
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Tab content */}
      {tab === 'overview' && (
        <section className="grid gap-4 lg:grid-cols-3">
          {/* summary + highlights */}
          <div className="lg:col-span-2 space-y-4">
            {/* photo strip */}
            <div className="rounded-2xl border overflow-hidden">
              <div className="grid grid-cols-3 gap-1">
                {images.slice(0, 3).map((src, i) => (
                  <img
                    key={i}
                    src={src || FALLBACK_IMAGE}
                    alt={`${name} photo ${i + 1}`}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                    onError={e => { if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE }}
                  />
                ))}
              </div>
            </div>

            {/* top categories */}
            {stats.categories.length > 0 && (
              <div className="rounded-2xl border bg-white/70 p-4">
                <h2 className="text-base font-semibold mb-3">What guests rate highly</h2>
                <div className="flex flex-wrap gap-2">
                  {stats.categories
                    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
                    .slice(0, 6)
                    .map(c => (
                      <span
                        key={c.key}
                        className={`rounded-full bg-gradient-to-r ${categoryClass(c.key)} px-2.5 py-1 text-xs font-medium shadow-sm ring-1 ring-black/5`}
                        title={`${prettyCat(c.key)}: ${c.avg}/10`}
                      >
                        {prettyCat(c.key)} • {c.avg}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* quick facts */}
          <aside className="space-y-3">
            <div className="rounded-2xl border bg-white/70 p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Quick facts</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                {meta?.bedrooms != null && <li><b>{meta.bedrooms}</b> bedroom{meta.bedrooms === 1 ? '' : 's'}</li>}
                {meta?.bathrooms != null && <li><b>{meta.bathrooms}</b> bathroom{meta.bathrooms === 1 ? '' : 's'}</li>}
                {meta?.kitchen && <li>Kitchen: <b>{meta.kitchen}</b></li>}
                {meta?.size && <li>Size: <b>{meta.size}</b></li>}
                {meta?.address && <li>Address: <b>{meta.address}</b></li>}
                <li>Type: <b>{type}</b></li>
              </ul>
            </div>

            {meta?.amenities?.length ? (
              <div className="rounded-2xl border bg-white/70 p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-1.5">
                  {meta.amenities.map((a, i) => (
                    <span key={i} className="rounded-full border bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </section>
      )}

      {tab === 'photos' && (
        <section className="rounded-2xl border bg-white/70 p-4">
          <h2 className="text-base font-semibold mb-3">Photos</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((src, i) => (
              <div key={i} className="overflow-hidden rounded-xl border">
                <img
                  src={src || FALLBACK_IMAGE}
                  alt={`${name} photo ${i + 1}`}
                  className="h-56 w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                  loading="lazy"
                  onError={e => { if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'reviews' && (
        <section className="space-y-3">
          {rows.length === 0 && (
            <div className="rounded-xl border bg-white/70 p-4 text-gray-600">
              No reviews yet for this property.
            </div>
          )}

          {rows.map(r => (
            <article key={`${r.channel}:${r.id}`} className="bg-white/80 border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900">{r.guest ?? 'Guest'}</div>
                <div className="text-indigo-600 font-semibold">
                  {r.rating != null ? `${r.rating} / 10` : '—'}
                </div>
              </div>

              {r.comment && <p className="text-gray-800 text-[15px] leading-7">{r.comment}</p>}

              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                {r.submittedAt && <span>{prettyDate(r.submittedAt)}</span>}
                <span>•</span>
                <span className="capitalize">{r.channel}</span>
              </div>

              {(r.categories || []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.categories.map(c => (
                    <span
                      key={c.key}
                      className={`rounded-full bg-gradient-to-r ${categoryClass(c.key)} px-2 py-0.5 text-[11px] font-medium shadow-sm ring-1 ring-black/5`}
                      title={`${prettyCat(c.key)}: ${c.rating ?? '—'}/10`}
                    >
                      {prettyCat(c.key)} • {c.rating ?? '—'}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      {tab === 'highlights' && (
        <section className="rounded-2xl border bg-white/70 p-4">
          <h2 className="text-base font-semibold mb-3">Highlights</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border p-3 bg-gradient-to-br from-slate-50 to-white">
              <div className="text-xs text-gray-500">Overall</div>
              <div className="text-lg font-semibold text-indigo-700"><StarRating10 value={stats.avgRating} /></div>
            </div>
            {stats.categories
              .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
              .slice(0, 6)
              .map(c => (
                <div key={c.key} className="rounded-xl border p-3 bg-gradient-to-br from-slate-50 to-white">
                  <div className="text-xs text-gray-500">{prettyCat(c.key)}</div>
                  <div className="text-lg font-semibold text-gray-900">{c.avg ?? '—'} / 10</div>
                </div>
              ))}
          </div>
        </section>
      )}

      {tab === 'details' && (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border bg-white/70 p-4">
            <h2 className="text-base font-semibold mb-3">Property details</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Type" value={type} />
              {meta?.bedrooms != null && <Detail label="Bedrooms" value={`${meta.bedrooms}`} />}
              {meta?.bathrooms != null && <Detail label="Bathrooms" value={`${meta.bathrooms}`} />}
              {meta?.kitchen && <Detail label="Kitchen" value={meta.kitchen} />}
              {meta?.size && <Detail label="Size" value={meta.size} />}
              {meta?.address && <Detail label="Address" value={meta.address} />}
            </div>
          </div>

          <div className="rounded-2xl border bg-white/70 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">More photos</h3>
            <div className="grid grid-cols-2 gap-2">
              {images.slice(1, 5).map((src, i) => (
                <img
                  key={i}
                  src={src || FALLBACK_IMAGE}
                  alt={`${name} extra ${i + 1}`}
                  className="h-28 w-full object-cover rounded-lg border"
                  loading="lazy"
                  onError={e => { if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* back link */}
      <div className="pt-2">
        <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 underline">
          ← Back to all properties
        </Link>
      </div>
    </div>
  )
}

/* ------------- tiny detail component ------------- */

function Detail({ label, value }: { label: string; value?: string | number }) {
  if (value == null || value === '') return null
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{String(value)}</span>
    </div>
  )
}
