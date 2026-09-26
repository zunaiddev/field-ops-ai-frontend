import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentUser } from '../../context/UserContext'

export interface EmployeeRouteProps {
  children?: ReactNode
  redirectPath?: string
  allowedRoles?: string[]
}

export default function EmployeeRoute({
  children,
  redirectPath = '/service-requests',
  allowedRoles,
}: EmployeeRouteProps) {
  const { currentUser, isLoading } = useCurrentUser()

  if (isLoading) {
    return null
  }

  // Technician can ONLY see Service Requests and Schedules (nothing else)
  if (currentUser.role === 'TECHNICIAN') {
    if (!allowedRoles || !allowedRoles.includes('TECHNICIAN')) {
      return <Navigate to={redirectPath} replace />
    }
  }

  // Customer role restriction
  if (currentUser.role === 'CUSTOMER') {
    if (!allowedRoles || !allowedRoles.includes('CUSTOMER')) {
      return <Navigate to={redirectPath} replace />
    }
  }

  // General allowedRoles check
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={redirectPath} replace />
  }

  return <>{children ?? <Outlet />}</>
}
