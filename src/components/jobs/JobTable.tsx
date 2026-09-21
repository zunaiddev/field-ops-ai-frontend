import type { FC } from 'react'
import type { Job, JobPriority, JobStatus } from '../../types/app'

interface JobTableProps {
  jobs: Job[]
  onViewJob?: (job: Job) => void
}

const statusBadgeStyles: Record<JobStatus, { bg: string; text: string; dot: string; label: string }> = {
  IN_PROGRESS: {
    bg: 'bg-blue-50 ring-blue-700/20',
    text: 'text-blue-700',
    dot: 'bg-blue-600',
    label: 'In Progress',
  },
  SCHEDULED: {
    bg: 'bg-purple-50 ring-purple-700/20',
    text: 'text-purple-700',
    dot: 'bg-purple-600',
    label: 'Scheduled',
  },
  COMPLETED: {
    bg: 'bg-emerald-50 ring-emerald-700/20',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    label: 'Completed',
  },
  PENDING: {
    bg: 'bg-amber-50 ring-amber-700/20',
    text: 'text-amber-700',
    dot: 'bg-amber-600',
    label: 'Pending',
  },
  CANCELLED: {
    bg: 'bg-slate-100 ring-slate-600/20',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
    label: 'Cancelled',
  },
}

const priorityBadgeStyles: Record<JobPriority, string> = {
  URGENT: 'bg-red-50 text-red-700 ring-red-600/20 font-semibold',
  HIGH: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  MEDIUM: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  LOW: 'bg-slate-50 text-slate-600 ring-slate-400/20',
}

export const JobTable: FC<JobTableProps> = ({ jobs, onViewJob }) => {
  if (jobs.length === 0) {
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
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          />
        </svg>
        <h3 className="mt-3 text-sm font-semibold text-slate-900">No jobs found</h3>
        <p className="mt-1 text-xs text-slate-500">
          No field assignments matched your current search filters.
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
                Job Details
              </th>
              <th scope="col" className="px-4 py-3.5">
                Customer & Location
              </th>
              <th scope="col" className="px-4 py-3.5">
                Assigned Staff
              </th>
              <th scope="col" className="px-4 py-3.5">
                Priority
              </th>
              <th scope="col" className="px-4 py-3.5">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5">
                Scheduled Time
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => {
              const statusCfg = statusBadgeStyles[job.status]
              return (
                <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Title & Job Number */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{job.title}</div>
                    <div className="text-[11px] font-mono text-slate-400">{job.jobNumber}</div>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-medium text-slate-800">{job.customerName}</div>
                    <div className="text-[11px] text-slate-400">{job.location}</div>
                  </td>

                  {/* Assignee */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                        {job.assignedEmployeeName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                      {job.assignedEmployeeName}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] ring-1 ${
                        priorityBadgeStyles[job.priority]
                      }`}
                    >
                      {job.priority}
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

                  {/* Date & Duration */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-700">
                    <div>{job.scheduledDate}</div>
                    {job.estimatedDuration && (
                      <div className="text-[11px] text-slate-400">Est: {job.estimatedDuration}</div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => onViewJob?.(job)}
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

export default JobTable
