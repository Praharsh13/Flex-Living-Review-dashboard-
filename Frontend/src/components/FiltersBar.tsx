import React from 'react'
import type { Filters } from '../types'

type Props = {
  values: Filters
  onChange: (next: Filters) => void
  listings: string[]
  channels: string[]
}

export default function FiltersBar({ values, onChange, listings, channels }: Props) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...values, [k]: v })
  const reset = () =>
    onChange({
      listing: '', channel: '', category: '', minRating: 0,
      from: '', to: '', search: '', sortBy: 'date', sortDir: 'desc'
    })

  const fieldBase =
    'w-full h-10 rounded-lg border border-slate-600 bg-slate-800/70 ' +
    'px-3 text-sm text-slate-100 placeholder-slate-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 ' +
    'transition-colors'

  const labelCls = 'text-xs font-medium text-slate-300 mb-1'
  const cell = 'flex flex-col'

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 md:p-5 backdrop-blur">
      {/* Top grid: 1 → 2 → 4 columns. No overlap. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Listing */}
        <div className={cell}>
          <label className={labelCls} htmlFor="listing">Listing</label>
          <select id="listing" className={fieldBase} value={values.listing} onChange={e => set('listing', e.target.value)}>
            <option value="">All listings</option>
            {listings.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* Channel */}
        <div className={cell}>
          <label className={labelCls} htmlFor="channel">Channel</label>
          <select id="channel" className={fieldBase} value={values.channel} onChange={e => set('channel', e.target.value)}>
            <option value="">All channels</option>
            {channels.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Category */}
        <div className={cell}>
          <label className={labelCls} htmlFor="category">Category</label>
          <select id="category" className={fieldBase} value={values.category} onChange={e => set('category', e.target.value)}>
            <option value="">Any category</option>
            <option value="cleanliness">cleanliness</option>
            <option value="communication">communication</option>
            <option value="respect_house_rules">respect_house_rules</option>
            <option value="location">location</option>
            <option value="value">value</option>
          </select>
        </div>

        {/* Min rating */}
        <div className={cell}>
          <label className={labelCls} htmlFor="minRating">Min rating</label>
          <input
            id="minRating"
            className={fieldBase}
            type="number"
            min={0}
            max={10}
            step={1}
            placeholder="0–10"
            value={values.minRating || ''}
            onChange={e => set('minRating', Number(e.target.value || 0))}
          />
        </div>

        {/* From date */}
        <div className={cell}>
          <label className={labelCls} htmlFor="from">From</label>
          <input
            id="from"
            className={`${fieldBase} [color-scheme:dark]`}
            type="date"
            value={values.from}
            onChange={e => set('from', e.target.value)}
          />
        </div>

        {/* To date */}
        <div className={cell}>
          <label className={labelCls} htmlFor="to">To</label>
          <input
            id="to"
            className={`${fieldBase} [color-scheme:dark]`}
            type="date"
            value={values.to}
            onChange={e => set('to', e.target.value)}
          />
        </div>

        {/* Search spans 2 cols on large screens for breathing room */}
        <div className={`${cell} lg:col-span-2`}>
          <label className={labelCls} htmlFor="search">Search</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 9.5 16a6.47 6.47 0 0 0 4.23-1.57l.27.28h.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
              </svg>
            </span>
            <input
              id="search"
              className={`${fieldBase} pl-9`}
              placeholder="Guest / comment / listing"
              value={values.search}
              onChange={e => set('search', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bottom row: stacks nicely on small screens, no overlap */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
          <div className={cell}>
            <label className={labelCls} htmlFor="sortBy">Sort by</label>
            <select id="sortBy" className={fieldBase} value={values.sortBy} onChange={e => set('sortBy', e.target.value as any)}>
              <option value="date">Date</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className={cell}>
            <label className={labelCls} htmlFor="sortDir">Direction</label>
            <select id="sortDir" className={fieldBase} value={values.sortDir} onChange={e => set('sortDir', e.target.value as any)}>
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>

        <div className="flex justify-start sm:justify-end">
          <button
            onClick={reset}
            className="h-10 rounded-lg border border-slate-600 bg-slate-700 px-4 text-sm text-slate-100 hover:bg-slate-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

