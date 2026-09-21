import type { FC } from 'react'
import { Link } from 'react-router-dom'
import type { Customer, CustomerStatus } from '../../types/app'

interface RecentCustomersProps {
  customers: Customer[]
  viewAllLink?: string
}

const statusBadgeStyles: Record<CustomerStatus, { bg: string; text: string; label: string }> = {
  ACTIVE: {
    bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    text: 'text-emerald-700',
    label: 'Active Contract',
  },
  PENDING: {
    bg: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    text: 'text-amber-700',
    label: 'Pending Onboarding',
  },
  INACTIVE: {
    bg: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    text: 'text-slate-600',
    label: 'Inactive',
  },
}

export const RecentCustomers: FC<RecentCustomersProps> = ({
  customers,
  viewAllLink = '/customers',
}) => {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Key Customer Accounts</h2>
          <p className="text-xs text-slate-500">Service locations and recent activity</p>
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            All accounts &rarr;
          </Link>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {customers.slice(0, 4).map((cust) => {
          const statusCfg = statusBadgeStyles[cust.status]
          return (
            <div
              key={cust.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="min-w-0 flex-1 pr-3">
                <p className="truncate text-xs font-semibold text-slate-900">{cust.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="truncate">{cust.contactPerson}</span>
                  <span>&bull;</span>
                  <span>
                    {cust.city}, {cust.state}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  <span className="font-semibold text-slate-900">{cust.totalJobs}</span> total jobs
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

export default RecentCustomers
