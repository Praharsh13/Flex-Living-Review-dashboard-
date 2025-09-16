import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/api'
import { saveToken } from '../auth'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await login(email, password)
      saveToken(res.token)

      // 🔔 tell the app that auth state changed (so nav updates immediately)
      window.dispatchEvent(new CustomEvent('auth:changed'))

      // go to dashboard
      nav('/admin', { replace: true })
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-[#0b1224] relative">
      {/* backdrop */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(800px 400px at 10% -10%, rgba(99,102,241,.25), transparent 60%),' +
            'radial-gradient(600px 300px at 90% 0%, rgba(16,185,129,.18), transparent 60%),' +
            '#0b1224',
          backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
        }}
      />

      <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4">
        <div className="w-full rounded-2xl backdrop-blur bg-slate-800/60 ring-1 ring-white/10 shadow-xl shadow-black/20 p-6 md:p-7">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-white">Admin Login</h1>
            <p className="mt-1 text-sm text-slate-300">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full h-11 rounded-lg border border-slate-600 bg-slate-900/60 px-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full h-11 rounded-lg border border-slate-600 bg-slate-900/60 px-3 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-slate-300 hover:text-white"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full h-11 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
