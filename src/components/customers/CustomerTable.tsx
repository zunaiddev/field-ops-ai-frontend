import { useState, type FC } from 'react'
import type { Customer } from '../../types/customer'
import { MapPinIcon, TrashIcon, ClockIcon } from '../icons'

interface CustomerTableProps {
  customers: Customer[]
  onViewCustomer?: (customer: Customer, tab?: 'addresses' | 'history') => void
  onDeleteCustomer?: (customer: Customer) => Promise<void> | void
}

const statusBadgeStyles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
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

function formatDate(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return '—'
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export const CustomerTable: FC<CustomerTableProps> = ({
  customers,
  onViewCustomer,
  onDeleteCustomer,
}) => {
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!customerToDelete || !onDeleteCustomer) return
    setIsDeleting(true)
    try {
      await onDeleteCustomer(customerToDelete)
      setCustomerToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

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
      {/* Table Delete Confirmation Modal / Banner */}
      {customerToDelete && (
        <div className="border-b border-rose-200 bg-rose-50 p-4 transition-all animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <TrashIcon className="h-4 w-4" />
              </div>
              <div className="text-xs text-rose-900">
                <p className="font-semibold">
                  Are you sure you want to delete &quot;{customerToDelete.name}&quot;?
                </p>
                <p className="text-rose-700">This action will remove all customer details and addresses permanently.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                disabled={isDeleting}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Customer Name
              </th>
              <th scope="col" className="px-4 py-3.5">
                Email Address
              </th>
              <th scope="col" className="px-4 py-3.5">
                Phone
              </th>
              <th scope="col" className="px-4 py-3.5">
                External Ref
              </th>
              <th scope="col" className="px-4 py-3.5">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5">
                Created Date
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((cust) => {
              const statusCfg = statusBadgeStyles[cust.status] ?? {
                bg: 'bg-slate-100 ring-slate-500/20',
                text: 'text-slate-600',
                dot: 'bg-slate-500',
                label: cust.status || 'Unknown',
              }
              const initial = (cust.name?.[0] || 'C').toUpperCase()

              return (
                <tr
                  key={cust.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => onViewCustomer?.(cust, 'addresses')}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-xs font-semibold text-white shadow-xs group-hover:bg-teal-700 transition-colors">
                        {initial}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {cust.name}
                        </div>
                        <div className="text-[11px] text-slate-400">ID: #{cust.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-700">
                    {cust.email}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-600">
                    {cust.phone || '—'}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                    {cust.externalReference ? (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
                        {cust.externalReference}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                    {formatDate(cust.createdAt)}
                  </td>

                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onViewCustomer?.(cust, 'addresses')}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                        title="View Customer Addresses & Details"
                      >
                        <MapPinIcon className="h-3.5 w-3.5" />
                        <span>Addresses</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onViewCustomer?.(cust, 'history')}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                        title="View Customer Audit History"
                      >
                        <ClockIcon className="h-3.5 w-3.5" />
                        <span>History</span>
                      </button>

                      {onDeleteCustomer && (
                        <button
                          type="button"
                          onClick={() => setCustomerToDelete(cust)}
                          className="inline-flex items-center rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                          title="Delete Customer"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
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
