import type { FC } from 'react'
import type { Customer, CustomerStatus } from '../../types/app'

interface CustomerTableProps {
  customers: Customer[]
  onViewCustomer?: (customer: Customer) => void
}

const statusBadgeStyles: Record<CustomerStatus, { bg: string; text: string; dot: string; label: string }> = {
  ACTIVE: {
    bg: 'bg-emerald-50 ring-emerald-600/20',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    label: 'Active',
  },
  PENDING: {
    bg: 'bg-amber-50 ring-amber-600/20',
    text: 'text-amber-700',
    dot: 'bg-amber-600',
    label: 'Pending',
  },
  INACTIVE: {
    bg: 'bg-slate-100 ring-slate-500/20',
    text: 'text-slate-600',
    dot: 'bg-slate-500',
    label: 'Inactive',
  },
}

export const CustomerTable: FC<CustomerTableProps> = ({ customers, onViewCustomer }) => {
  if (customers.length === 0) {
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
            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
          />
        </svg>
        <h3 className="mt-3 text-sm font-semibold text-slate-900">No customers found</h3>
        <p className="mt-1 text-xs text-slate-500">
          Try adjusting your search criteria or filter options to locate customer accounts.
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
                Customer Account
              </th>
              <th scope="col" className="px-4 py-3.5">
                Primary Contact
              </th>
              <th scope="col" className="px-4 py-3.5">
                Phone
              </th>
              <th scope="col" className="px-4 py-3.5">
                Location
              </th>
              <th scope="col" className="px-4 py-3.5">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5">
                Total Jobs
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((cust) => {
              const statusCfg = statusBadgeStyles[cust.status]
              return (
                <tr
                  key={cust.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Account Name */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{cust.name}</div>
                    <div className="text-[11px] text-slate-400">{cust.address}</div>
                  </td>

                  {/* Primary Contact */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-medium text-slate-800">{cust.contactPerson}</div>
                    <div className="text-[11px] text-slate-400">{cust.email}</div>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-600">
                    {cust.phone}
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-700">
                    {cust.city}, {cust.state}
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

                  {/* Total Jobs */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-semibold text-slate-900">{cust.totalJobs}</span>
                    <span className="text-slate-400 text-[11px] ml-1">completed</span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => onViewCustomer?.(cust)}
                      className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      View
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

export default CustomerTable
