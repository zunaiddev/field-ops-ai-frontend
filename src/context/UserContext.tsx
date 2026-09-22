import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { mockCurrentUser } from '../constants/mockData'
import type { CurrentUser, UserRole } from '../types/app'
import type { EmployeeProfileResponse, LoginResponse } from '../types/auth'
import authService from '../services/authService'

export interface UserContextType {
  currentUser: CurrentUser
  isAuthenticated: boolean
  isLoading: boolean
  setCurrentRole: (role: UserRole) => void
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser>>
  setUserFromAuth: (
    loginData: LoginResponse,
    employeeData?: EmployeeProfileResponse | null,
  ) => CurrentUser
  fetchCurrentUser: () => Promise<CurrentUser | null>
  logout: () => Promise<void>
}

export function buildCurrentUser(
  data?: Partial<EmployeeProfileResponse> | null,
  loginData?: Partial<LoginResponse> | null,
  previousUser?: CurrentUser | null,
): CurrentUser {
  const emp = data?.employee || data
  const org = data?.organization

  const email = emp?.email || loginData?.email || previousUser?.email || ''
  const id = String(emp?.id || loginData?.id || previousUser?.id || '')
  const employeeId = emp?.employeeId ? String(emp.employeeId) : previousUser?.employeeId
  const firstName = emp?.firstName || previousUser?.firstName || ''
  const lastName = emp?.lastName || previousUser?.lastName || ''

  let name = ''
  if (firstName && lastName) {
    name = `${firstName} ${lastName}`.trim()
  } else if (firstName) {
    name = firstName
  } else if (lastName) {
    name = lastName
  } else if (previousUser?.name && previousUser.name !== 'User') {
    name = previousUser.name
  } else if (email) {
    name = email.split('@')[0]
  } else {
    name = 'User'
  }

  const role = (emp?.role || loginData?.role || previousUser?.role || 'ORG_OWNER') as UserRole
  const organizationName =
    org?.name || previousUser?.organizationName || 'FieldOps Organization'
  const organizationId = org?.id ?? previousUser?.organizationId
  const organizationSlug = org?.slug ?? previousUser?.organizationSlug
  const timezone = org?.timezone ?? previousUser?.timezone
  const currency = org?.currency ?? previousUser?.currency

  return {
    id,
    employeeId,
    name,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    email,
    role,
    organizationName,
    organizationId,
    organizationSlug,
    timezone,
    currency,
    status: emp?.status || previousUser?.status || 'ACTIVE',
    phone: emp?.phone !== undefined ? emp.phone : (previousUser?.phone ?? null),
    emailVerifiedAt:
      emp?.emailVerifiedAt !== undefined
        ? emp.emailVerifiedAt
        : (previousUser?.emailVerifiedAt ?? null),
    lastLoginAt:
      emp?.lastLoginAt !== undefined
        ? emp.lastLoginAt
        : (previousUser?.lastLoginAt ?? null),
    createdAt: emp?.createdAt || previousUser?.createdAt,
    updatedAt: emp?.updatedAt || previousUser?.updatedAt,
  }
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const USER_STORAGE_KEY = 'user'

function getInitialUser(): CurrentUser {
  try {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (savedUser) {
      return JSON.parse(savedUser)
    }
  } catch (e) {
    console.error('Error parsing stored user data', e)
  }
  return mockCurrentUser
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(getInitialUser)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('token'))
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchCurrentUser = async (): Promise<CurrentUser | null> => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsAuthenticated(false)
      setIsLoading(false)
      return null
    }

    try {
      const response = await authService.getEmployeeProfile()
      if (response.success && response.payload) {
        const updated = buildCurrentUser(response.payload, null, currentUser)
        setCurrentUser(updated)
        setIsAuthenticated(true)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated))
        return updated
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem(USER_STORAGE_KEY)
        setIsAuthenticated(false)
        return null
      }
    } catch (err) {
      console.error('Failed to fetch employee details:', err)
    } finally {
      setIsLoading(false)
    }
    return currentUser
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchCurrentUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const setCurrentRole = (role: UserRole) => {
    setCurrentUser((prev) => {
      const updated = {
        ...prev,
        role,
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const setUserFromAuth = (
    loginData: LoginResponse,
    employeeData?: EmployeeProfileResponse | null,
  ): CurrentUser => {
    const user = buildCurrentUser(employeeData, loginData, currentUser)
    setCurrentUser(user)
    setIsAuthenticated(true)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    return user
  }

  const logout = async () => {
    try {
      const response = await authService.logout()
      if (response.success) {
        toast.success('Logged out successfully')
      } else if (response.error?.message) {
        toast.error(response.error.message)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('access_token')
      localStorage.removeItem(USER_STORAGE_KEY)
      sessionStorage.removeItem('token')
      setIsAuthenticated(false)
      window.location.href = '/auth/login'
    }
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        setCurrentRole,
        setCurrentUser,
        setUserFromAuth,
        fetchCurrentUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useCurrentUser(): UserContextType {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useCurrentUser must be used within a UserProvider')
  }
  return context
}
