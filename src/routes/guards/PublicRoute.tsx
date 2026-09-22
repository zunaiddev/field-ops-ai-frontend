import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentUser } from '../../context/UserContext'

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
  isAuthenticated: propIsAuthenticated,
}: PublicRouteProps) {
  const { isAuthenticated: contextIsAuthenticated, isLoading } = useCurrentUser()

  const isAuth = propIsAuthenticated !== undefined ? propIsAuthenticated : contextIsAuthenticated

  if (isLoading && Boolean(localStorage.getItem('token'))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Checking session...</p>
        </div>
      </div>
    )
  }

  if (isAuth) {
    return <Navigate to={redirectPath} replace />
  }

  return <>{children ?? <Outlet />}</>
}
