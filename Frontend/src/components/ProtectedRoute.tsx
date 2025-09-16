import React from 'react'
import { Navigate } from 'react-router-dom'
import { isLoggedIn } from '../auth'  // your existing helper

type Props = {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  if (!isLoggedIn()) {
    // Not logged in: send them to login
    return <Navigate to="/login" replace />
  }
  // Logged in: allow access
  return <>{children}</>
}