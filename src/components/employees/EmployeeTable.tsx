import type { FC } from 'react'
import type { Employee } from '../../types/organization'

interface EmployeeTableProps {
  employees: Employee[]
  onViewEmployee?: (employee: Employee) => void
}

const roleBadgeStyles: Record<string, { bg: string; text: string }> = {
  OWNER: { bg: 'bg-blue-50 text-blue-700 ring-blue-700/20', text: 'Owner' },
  ORG_OWNER: { bg: 'bg-blue-50 text-blue-700 ring-blue-700/20', text: 'Owner' },
  ADMIN: { bg: 'bg-indigo-50 text-indigo-700 ring-indigo-700/20', text: 'Admin' },
  ORG_ADMIN: { bg: 'bg-indigo-50 text-indigo-700 ring-indigo-700/20', text: 'Admin' },
  MANAGER: { bg: 'bg-violet-50 text-violet-700 ring-violet-700/20', text: 'Manager' },
  EMPLOYEE: { bg: 'bg-slate-100 text-slate-700 ring-slate-600/20', text: 'Field Tech' },
  TECHNICIAN: { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-700/20', text: 'Technician' },
  DISPATCHER: { bg: 'bg-cyan-50 text-cyan-700 ring-cyan-700/20', text: 'Dispatcher' },
  INVENTORY_MANAGER: { bg: 'bg-amber-50 text-amber-700 ring-amber-700/20', text: 'Inventory Manager' },
  FINANCE: { bg: 'bg-teal-50 text-teal-700 ring-teal-700/20', text: 'Finance' },
  VIEWER: { bg: 'bg-slate-100 text-slate-700 ring-slate-600/20', text: 'Viewer' },
}

const statusBadgeStyles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  ACTIVE: {
    bg: 'bg-emerald-50 ring-emerald-600/20',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    label: 'Active',
  },
  ON_LEAVE: {
    bg: 'bg-amber-50 ring-amber-600/20',
    text: 'text-amber-700',
    dot: 'bg-amber-600',
    label: 'On Leave',
  },
  INACTIVE: {
    bg: 'bg-slate-100 ring-slate-500/20',
    text: 'text-slate-600',
    dot: 'bg-slate-500',
    label: 'Inactive',
  },
}

function formatDate(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return 'Never'
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return 'Never'
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return 'Never'
  }
}

export const EmployeeTable: FC<EmployeeTableProps> = ({ employees, onViewEmployee }) => {
  if (employees.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
        <h3 className="mt-3 text-sm font-semibold text-slate-900">No employees found</h3>
        <p className="mt-1 text-xs text-slate-500">
          Try adjusting your search criteria or filter options to locate staff members.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Staff Member
              </th>
              <th scope="col" className="px-4 py-3.5">
                Role
              </th>
              <th scope="col" className="px-4 py-3.5">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5">
                Contact
              </th>
              <th scope="col" className="px-4 py-3.5">
                Last Login
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => {
              const roleCfg = roleBadgeStyles[emp.role] ?? {
                bg: 'bg-slate-100 text-slate-700 ring-slate-600/20',
                text: emp.role || 'Member',
              }
              const statusCfg = statusBadgeStyles[emp.status] ?? {
                bg: 'bg-slate-100 ring-slate-500/20',
                text: 'text-slate-600',
                dot: 'bg-slate-500',
                label: emp.status || 'Unknown',
              }
              const displayName =
                `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
                emp.email ||
                'Unnamed'
              const firstInitial = (emp.firstName?.[0] || displayName[0] || 'U').toUpperCase()
              const lastInitial = (emp.lastName?.[0] || '').toUpperCase()

              return (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Name + Initials Avatar */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-semibold text-white shadow-xs"
                      >
                        {firstInitial}
                        {lastInitial}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{displayName}</div>
                        <div className="text-[11px] text-slate-400">{emp.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ${roleCfg.bg}`}
                    >
                      {roleCfg.text}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                    {emp.phone || '—'}
                  </td>

                  {/* Last Login */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                    {formatDate(emp.lastLoginAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => onViewEmployee?.(emp)}
                      className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EmployeeTable
