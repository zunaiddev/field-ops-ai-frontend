import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export interface PublicRouteProps {
  children?: ReactNode
  redirectPath?: string
  isAuthenticated?: boolean
}

/**
 * PublicRoute component (Guest Guard)
 * Used for authentication pages like Login and Organization Registration.
 * If user is already authenticated, redirects them to the main application (e.g. /dashboard).
 */
export default function PublicRoute({
  children,
  redirectPath = '/dashboard',
  isAuthenticated = false, // Placeholder for auth context/state
}: PublicRouteProps) {
  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  return <>{children ?? <Outlet />}</>
}
