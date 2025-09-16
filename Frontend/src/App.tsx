

import './App.css'
import './index.css'
import { BrowserRouter,Routes,Route,Link } from 'react-router-dom'
import { isLoggedIn,logout } from './auth'
import Login from './pages/Login'
import Property from './pages/Property'
import Dashboard from './pages/Dashboard'
import HomePublic from './pages/HomePage'
import ReviewDetails from './pages/ReviewDetails'
import ProtectedRoute from './components/ProtectedRoute'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState,useEffect } from 'react'



function Header() {
  const nav = useNavigate()
  const [authed, setAuthed] = useState(() => isLoggedIn())

  useEffect(() => {
    const onAuth = () => setAuthed(isLoggedIn())
    window.addEventListener('auth:changed', onAuth)
    window.addEventListener('storage', onAuth) 
    return () => {
      window.removeEventListener('auth:changed', onAuth)
      window.removeEventListener('storage', onAuth)
    }
  }, [])

  function handleLogout() {
    logout()
    
    window.dispatchEvent(new CustomEvent('auth:changed'))
    nav('/login', { replace: true })
  }

  const linkBase =
    'px-2 py-1 rounded-md hover:bg-gray-50 transition-colors'
  const linkActive = 'text-brand-600 font-medium'
  const linkInactive = 'text-gray-600'

  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-brand-600">Flex Living</Link>

        <nav className="text-sm flex gap-1.5 items-center">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Home
          </NavLink>

          {authed && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Dashboard
            </NavLink>
          )}

          {authed ? (
            <button
              onClick={handleLogout}
              className="ml-2 border rounded-md px-3 py-1.5 text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `ml-2 border rounded-md px-3 py-1.5 ${isActive ? 'border-brand-600 text-brand-600' : 'text-gray-700 hover:bg-gray-50'}`
              }
            >
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
function App() {
  
  return (
    
    <BrowserRouter>
    
      <Header />
      <main className="mx
      -auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <Routes>
  {/* Public */}
  <Route path="/" element={<HomePublic />} />
  <Route path="/property/:name" element={<Property />} />
  <Route path="/login" element={<Login />} />

  {/* Admin (protected) */}
  <Route
    path="/admin"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
  <Route
    path="/admin/review/:id"
    element={
      <ProtectedRoute>
        <ReviewDetails />
      </ProtectedRoute>
    }
  />
</Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
