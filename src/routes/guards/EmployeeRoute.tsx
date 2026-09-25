import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentUser } from '../../context/UserContext'

export interface EmployeeRouteProps {
  children?: ReactNode
  redirectPath?: string
}

export default function EmployeeRoute({
  children,
  redirectPath = '/service-requests',
}: EmployeeRouteProps) {
  const { currentUser, isLoading } = useCurrentUser()

  if (isLoading) {
    return null
  }

  if (currentUser.role === 'CUSTOMER') {
    return <Navigate to={redirectPath} replace />
  }

  return <>{children ?? <Outlet />}</>
}
