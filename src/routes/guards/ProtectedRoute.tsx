import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentUser } from '../../context/UserContext'

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
  isAuthenticated: propIsAuthenticated,
}: ProtectedRouteProps) {
  const { isAuthenticated: contextIsAuthenticated, isLoading } = useCurrentUser()

  const isAuth = propIsAuthenticated !== undefined ? propIsAuthenticated : contextIsAuthenticated

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Loading FieldOps...</p>
        </div>
      </div>
    )
  }

  if (!isAuth) {
    return <Navigate to={redirectPath} replace />
  }

  return <>{children ?? <Outlet />}</>
}
