import type { FC } from 'react'
import { useCurrentUser } from '../../context/UserContext'
import { BuildingIcon, MenuIcon } from '../icons'
import type { UserRole } from '../../types/app'

interface HeaderProps {
  onMenuToggle: () => void
}

export const Header: FC<HeaderProps> = ({ onMenuToggle }) => {
  const { currentUser, setCurrentRole } = useCurrentUser()

  const roles: UserRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Open sidebar navigation"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        {/* Organization & Environment Badge */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
            <BuildingIcon className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-semibold">{currentUser.organizationName}</span>
          </div>
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/20">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Ops
          </span>
        </div>
      </div>

      {/* Right controls: Role switcher & User status */}
      <div className="flex items-center gap-3">
        {/* Role Preview Switcher (UI tester) */}
        <div className="flex items-center gap-2">
          <label htmlFor="role-select" className="text-xs font-medium text-slate-500 hidden md:inline">
            Role Preview:
          </label>
          <select
            id="role-select"
            value={currentUser.role}
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
            title="Switch mock role to preview role-based UI"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* User initials bubble */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-semibold text-white shadow-xs">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div className="hidden text-left xl:block">
            <p className="text-xs font-semibold text-slate-900 leading-none">{currentUser.name}</p>
            <p className="mt-1 text-[11px] text-slate-500 leading-none">{currentUser.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
