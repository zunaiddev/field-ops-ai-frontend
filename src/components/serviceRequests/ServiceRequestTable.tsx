import type { FC } from 'react'
import type {
  ServiceRequest,
  ServiceRequestCategory,
  ServiceRequestPriority,
  ServiceRequestStatus,
  ServiceRequestSource,
} from '../../types/serviceRequest'
import { EyeIcon, PencilIcon } from '../icons'

interface ServiceRequestTableProps {
  requests: ServiceRequest[]
  onViewRequest: (request: ServiceRequest) => void
  onEditRequest?: (request: ServiceRequest) => void
}

export const statusBadgeStyles: Record<
  ServiceRequestStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  NEW: {
    bg: 'bg-blue-50 ring-blue-600/20',
    text: 'text-blue-700',
    dot: 'bg-blue-600',
    label: 'New',
  },
  PENDING: {
    bg: 'bg-amber-50 ring-amber-600/20',
    text: 'text-amber-700',
    dot: 'bg-amber-600',
    label: 'Pending',
  },
  ASSIGNED: {
    bg: 'bg-purple-50 ring-purple-600/20',
    text: 'text-purple-700',
    dot: 'bg-purple-600',
    label: 'Assigned',
  },
  IN_PROGRESS: {
    bg: 'bg-indigo-50 ring-indigo-600/20',
    text: 'text-indigo-700',
    dot: 'bg-indigo-600',
    label: 'In Progress',
  },
  RESOLVED: {
    bg: 'bg-emerald-50 ring-emerald-600/20',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    label: 'Resolved',
  },
  COMPLETED: {
    bg: 'bg-teal-50 ring-teal-600/20',
    text: 'text-teal-700',
    dot: 'bg-teal-600',
    label: 'Completed',
  },
  CANCELLED: {
    bg: 'bg-rose-50 ring-rose-600/20',
    text: 'text-rose-700',
    dot: 'bg-rose-600',
    label: 'Cancelled',
  },
  REJECTED: {
    bg: 'bg-red-50 ring-red-600/20',
    text: 'text-red-700',
    dot: 'bg-red-600',
    label: 'Rejected',
  },
}

export const priorityBadgeStyles: Record<
  ServiceRequestPriority | string,
  { bg: string; text: string; label: string }
> = {
  CRITICAL: {
    bg: 'bg-red-50 text-red-700 ring-red-600/20',
    text: 'text-red-700',
    label: 'Critical',
  },
  URGENT: {
    bg: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    text: 'text-rose-700',
    label: 'Urgent',
  },
  HIGH: {
    bg: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    text: 'text-orange-700',
    label: 'High',
  },
  MEDIUM: {
    bg: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    text: 'text-amber-700',
    label: 'Medium',
  },
  LOW: {
    bg: 'bg-slate-100 text-slate-700 ring-slate-600/20',
    text: 'text-slate-700',
    label: 'Low',
  },
}

export const categoryBadgeStyles: Record<
  ServiceRequestCategory | string,
  { bg: string; text: string }
> = {
  NETWORK: { bg: 'bg-indigo-50 ring-indigo-600/20', text: 'text-indigo-700' },
  INSTALLATION: { bg: 'bg-cyan-50 ring-cyan-600/20', text: 'text-cyan-700' },
  REPAIR: { bg: 'bg-rose-50 ring-rose-600/20', text: 'text-rose-700' },
  MAINTENANCE: { bg: 'bg-emerald-50 ring-emerald-600/20', text: 'text-emerald-700' },
  INSPECTION: { bg: 'bg-violet-50 ring-violet-600/20', text: 'text-violet-700' },
  UPGRADE: { bg: 'bg-blue-50 ring-blue-600/20', text: 'text-blue-700' },
  EMERGENCY: { bg: 'bg-red-50 ring-red-600/20', text: 'text-red-700' },
  OTHER: { bg: 'bg-slate-100 ring-slate-600/20', text: 'text-slate-700' },
}

export const sourceBadgeStyles: Record<
  ServiceRequestSource,
  { bg: string; text: string; label: string }
> = {
  EMPLOYEE: {
    bg: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    text: 'text-indigo-700',
    label: 'Employee',
  },
  CUSTOMER: {
    bg: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    text: 'text-teal-700',
    label: 'Customer',
  },
  PORTAL: {
    bg: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    text: 'text-sky-700',
    label: 'Client Portal',
  },
  PHONE: {
    bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    text: 'text-emerald-700',
    label: 'Phone Call',
  },
  EMAIL: {
    bg: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    text: 'text-purple-700',
    label: 'Email Support',
  },
  SYSTEM: {
    bg: 'bg-slate-100 text-slate-700 ring-slate-600/20',
    text: 'text-slate-700',
    label: 'Automated System',
  },
}

function formatDate(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return '—'
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

export const ServiceRequestTable: FC<ServiceRequestTableProps> = ({
  requests,
  onViewRequest,
  onEditRequest,
}) => {
  if (requests.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-800">No service requests found</h3>
        <p className="mt-1 text-xs text-slate-400">
          Try adjusting your search criteria or create a new service ticket.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 sm:pl-6">
                Request # / Title
              </th>
              <th scope="col" className="px-3 py-3.5">
                Category
              </th>
              <th scope="col" className="px-3 py-3.5">
                Customer ID
              </th>
              <th scope="col" className="px-3 py-3.5">
                Priority
              </th>
              <th scope="col" className="px-3 py-3.5">
                Status
              </th>
              <th scope="col" className="px-3 py-3.5">
                Source
              </th>
              <th scope="col" className="px-3 py-3.5">
                Requested Date
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 text-right sm:pr-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {requests.map((req) => {
              const statusCfg = statusBadgeStyles[req.status] || {
                bg: 'bg-slate-100 ring-slate-500/20',
                text: 'text-slate-600',
                dot: 'bg-slate-500',
                label: req.status,
              }

              const priorityCfg = priorityBadgeStyles[req.priority] || {
                bg: 'bg-slate-100 text-slate-700 ring-slate-600/20',
                text: 'text-slate-700',
                label: req.priority,
              }

              const categoryCfg = categoryBadgeStyles[req.category] || {
                bg: 'bg-slate-100 ring-slate-600/20',
                text: 'text-slate-700',
              }

              const sourceCfg = sourceBadgeStyles[req.source] || {
                bg: 'bg-slate-100 text-slate-700 ring-slate-600/20',
                text: 'text-slate-700',
                label: req.source,
              }

              return (
                <tr
                  key={req.id}
                  className="group hover:bg-slate-50/60 transition-colors duration-150"
                >
                  {/* Title and ID */}
                  <td className="py-3.5 pl-4 pr-3 sm:pl-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          #REQ-{req.id}
                        </span>
                      </div>
                      <span className="font-medium text-slate-900 text-xs mt-0.5 line-clamp-1" title={req.title}>
                        {req.title}
                      </span>
                      {req.description && (
                        <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={req.description}>
                          {req.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${categoryCfg.bg} ${categoryCfg.text}`}
                    >
                      {req.category}
                    </span>
                  </td>

                  {/* Customer ID */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                      Cust #{req.customerId}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${priorityCfg.bg}`}
                    >
                      {priorityCfg.label}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Source */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ${sourceCfg.bg}`}
                    >
                      {sourceCfg.label}
                    </span>
                  </td>

                  {/* Requested Date */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">
                        {formatDate(req.requestedAt || req.createdAt)}
                      </span>
                      {req.slaDueAt && (
                        <span className="text-[10px] text-rose-600 font-medium">
                          SLA: {formatDate(req.slaDueAt)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-3 pr-4 text-right sm:pr-6 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {onEditRequest && (
                        <button
                          type="button"
                          onClick={() => onEditRequest(req)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-colors cursor-pointer"
                          title="Edit request"
                        >
                          <PencilIcon className="h-3.5 w-3.5 text-slate-500 hover:text-amber-600" />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onViewRequest(req)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
                        title="View request details"
                      >
                        <EyeIcon className="h-3.5 w-3.5 text-slate-500" />
                        <span>View Details</span>
                      </button>
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

export default ServiceRequestTable
