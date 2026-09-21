import type { FC } from 'react'
import { Link } from 'react-router-dom'
import type { Job, JobPriority, JobStatus } from '../../types/app'

interface RecentJobsProps {
  jobs: Job[]
  title?: string
  viewAllLink?: string
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

export const RecentJobs: FC<RecentJobsProps> = ({
  jobs,
  title = 'Recent Field Operations',
  viewAllLink = '/jobs',
}) => {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">Live view of scheduled and active assignments</p>
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            View all jobs &rarr;
          </Link>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            <tr>
              <th scope="col" className="px-5 py-3">
                Job
              </th>
              <th scope="col" className="px-4 py-3">
                Customer & Location
              </th>
              <th scope="col" className="px-4 py-3">
                Assignee
              </th>
              <th scope="col" className="px-4 py-3">
                Priority
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-5 py-3 text-right">
                Schedule
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.slice(0, 5).map((job) => {
              const statusCfg = statusBadgeStyles[job.status]
              return (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-sm">
                      {job.title}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {job.jobNumber}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-800">{job.customerName}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                      {job.location}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                        {job.assignedEmployeeName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                      {job.assignedEmployeeName}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] ring-1 ${
                        priorityBadgeStyles[job.priority]
                      }`}
                    >
                      {job.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-slate-700 whitespace-nowrap">
                    {job.scheduledDate}
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

export default RecentJobs
