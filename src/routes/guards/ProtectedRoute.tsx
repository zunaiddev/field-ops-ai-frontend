import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export interface ProtectedRouteProps {
  children?: ReactNode
  redirectPath?: string
  isAuthenticated?: boolean
}

/**
 * ProtectedRoute component
 * Ensures only authenticated users can access child routes.
 * Redirects unauthenticated users to login.
 */
export default function ProtectedRoute({
  children,
  redirectPath = '/auth/login',
  isAuthenticated = false, // Placeholder for auth context/state
}: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  return <>{children ?? <Outlet />}</>
}
