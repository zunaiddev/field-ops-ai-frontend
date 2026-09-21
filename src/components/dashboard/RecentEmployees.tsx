import type { FC } from 'react'
import { Link } from 'react-router-dom'
import type { Employee, EmployeeStatus } from '../../types/app'

interface RecentEmployeesProps {
  employees: Employee[]
  viewAllLink?: string
}

const statusBadgeStyles: Record<EmployeeStatus, { bg: string; text: string; label: string }> = {
  ACTIVE: {
    bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    text: 'text-emerald-700',
    label: 'Active',
  },
  ON_LEAVE: {
    bg: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    text: 'text-amber-700',
    label: 'On Leave',
  },
  INACTIVE: {
    bg: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    text: 'text-slate-600',
    label: 'Inactive',
  },
}

export const RecentEmployees: FC<RecentEmployeesProps> = ({
  employees,
  viewAllLink = '/employees',
}) => {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Active Field Staff</h2>
          <p className="text-xs text-slate-500">Technicians and assigned operations</p>
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Manage &rarr;
          </Link>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {employees.slice(0, 4).map((emp) => {
          const statusCfg = statusBadgeStyles[emp.status]
          return (
            <div key={emp.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    emp.avatarColor || 'bg-blue-600'
                  } font-semibold text-xs text-white shadow-xs`}
                >
                  {emp.firstName[0]}
                  {emp.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">{emp.name}</p>
                  <p className="truncate text-[11px] text-slate-500">{emp.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  <span className="font-semibold text-slate-900">{emp.assignedJobsCount}</span> jobs
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${statusCfg.bg}`}
                >
                  {statusCfg.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RecentEmployees
