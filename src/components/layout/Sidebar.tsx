import { type FC, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FieldOpsLogo } from '../ui/FieldOpsLogo'
import { useCurrentUser } from '../../context/UserContext'
import {
  CalendarIcon,
  CloseIcon,
  CustomersIcon,
  EmployeesIcon,
  LogoutIcon,
  ServiceRequestIcon,
  SettingsIcon,
  SkillsIcon,
  WrenchIcon,
} from '../icons'
import type { NavigationItem } from '../../types/app'

export const navigationItems: NavigationItem[] = [
  {
    label: 'Employees',
    path: '/employees',
    icon: EmployeesIcon,
    roles: ['OWNER', 'ORG_OWNER', 'ADMIN', 'ORG_ADMIN', 'MANAGER'],
    badge: '8',
  },
  {
    label: 'Technicians',
    path: '/technicians',
    icon: WrenchIcon,
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: CustomersIcon,
    badge: '7',
  },
  {
    label: 'Service Requests',
    path: '/service-requests',
    icon: ServiceRequestIcon,
  },
  {
    label: 'Schedules',
    path: '/schedules',
    icon: CalendarIcon,
    roles: ['OWNER', 'ORG_OWNER', 'ADMIN', 'ORG_ADMIN', 'MANAGER'],
  },
  {
    label: 'Skills',
    path: '/skills',
    icon: SkillsIcon,
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useCurrentUser()
  const location = useLocation()
  const isCustomer = currentUser.role === 'CUSTOMER'

  // Close mobile sidebar on route change
  useEffect(() => {
    onClose()
  }, [location.pathname])

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Filter navigation items based on current user role: CUSTOMER only gets Services tab
  const visibleNavItems = isCustomer
    ? [
        {
          label: 'Services',
          path: '/service-requests',
          icon: ServiceRequestIcon,
        },
      ]
    : navigationItems.filter(
        (item) => !item.roles || item.roles.includes(currentUser.role),
      )

  const roleBadgeStyles: Record<string, string> = {
    CUSTOMER: 'bg-emerald-50 text-emerald-700 ring-emerald-700/20',
    OWNER: 'bg-blue-50 text-blue-700 ring-blue-700/20',
    ORG_OWNER: 'bg-blue-50 text-blue-700 ring-blue-700/20',
    ADMIN: 'bg-indigo-50 text-indigo-700 ring-indigo-700/20',
    ORG_ADMIN: 'bg-indigo-50 text-indigo-700 ring-indigo-700/20',
    MANAGER: 'bg-violet-50 text-violet-700 ring-violet-700/20',
    DISPATCHER: 'bg-teal-50 text-teal-700 ring-teal-700/20',
    TECHNICIAN: 'bg-amber-50 text-amber-700 ring-amber-700/20',
    INVENTORY_MANAGER: 'bg-emerald-50 text-emerald-700 ring-emerald-700/20',
    FINANCE: 'bg-rose-50 text-rose-700 ring-rose-700/20',
    VIEWER: 'bg-slate-100 text-slate-700 ring-slate-600/20',
    EMPLOYEE: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  }

  const userInitials =
    (currentUser.name || currentUser.email || 'U')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white">
      {/* Top Header / Branding */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-5">
          <FieldOpsLogo size="sm" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Organization / Portal Context */}
        <div className="border-b border-slate-100 px-5 py-3">
          <p className="text-[11px] font-medium tracking-wider uppercase text-slate-400">
            {isCustomer ? 'Customer Portal' : 'Organization'}
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-slate-800">
            {currentUser.organizationName || 'FieldOps AI'}
          </p>
        </div>

        {/* Main Navigation Links */}
        <nav className="space-y-1 px-3 py-4" aria-label="Main Navigation">
          <div className="mb-2 px-3 text-[11px] font-medium tracking-wider uppercase text-slate-400">
            Menu
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs ring-1 ring-blue-700/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        isActive
                          ? 'text-blue-600'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section / Secondary Navigation & User Profile */}
      <div className="border-t border-slate-200/80 p-3 space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-700/10'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <SettingsIcon
                className={`h-5 w-5 shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span>Settings</span>
            </>
          )}
        </NavLink>

        {/* User Profile Card */}
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-semibold text-xs text-white shadow-xs">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">
                {currentUser.name}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center rounded px-1.5 py-0.2 text-[10px] font-medium ring-1 ${
                    roleBadgeStyles[currentUser.role] || roleBadgeStyles.EMPLOYEE
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:shrink-0 lg:border-r lg:border-slate-200 bg-white sticky top-0 h-screen z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isOpen && (
        <div className="relative z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onClose}
          />
          {/* Drawer Container */}
          <div className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
