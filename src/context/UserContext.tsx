import { createContext, useContext, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { mockCurrentUser } from '../constants/mockData'
import type { CurrentUser, UserRole } from '../types/app'
import authService from '../services/authService'

interface UserContextType {
  currentUser: CurrentUser
  setCurrentRole: (role: UserRole) => void
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(mockCurrentUser)

  const setCurrentRole = (role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
    }))
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
      sessionStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentRole, logout }}>
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
