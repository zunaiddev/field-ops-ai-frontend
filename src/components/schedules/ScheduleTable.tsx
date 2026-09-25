import { type FC } from 'react'
import { Button } from '../ui/Button'
import { CalendarIcon, EyeIcon, TrashIcon, WrenchIcon } from '../icons'
import type { Schedule } from '../../types/schedule'
import type { Technician } from '../../types/technician'

interface ScheduleTableProps {
  schedules: Schedule[]
  technicians?: Technician[]
  onViewSchedule: (schedule: Schedule) => void
  onDeleteSchedule: (schedule: Schedule) => void
}

const statusBadgeStyles: Record<string, string> = {
  SCHEDULED: 'bg-sky-50 text-sky-700 ring-sky-700/20 border-sky-200',
  DISPATCHED: 'bg-indigo-50 text-indigo-700 ring-indigo-700/20 border-indigo-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-700/20 border-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-700/20 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-rose-700/20 border-rose-200',
}

const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return dateStr
  }
}

export const ScheduleTable: FC<ScheduleTableProps> = ({
  schedules,
  technicians = [],
  onViewSchedule,
  onDeleteSchedule,
}) => {
  const getTechnicianName = (techId: number): string => {
    const tech = technicians.find((t) => t.id === techId)
    if (!tech) return `Technician #${techId}`
    if (tech.employee) {
      return (
        `${tech.employee.firstName || ''} ${tech.employee.lastName || ''}`.trim() ||
        `Technician #${techId}`
      )
    }
    return `Technician #${techId}`
  }

  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
          <CalendarIcon className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">No schedules found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          No schedules match your search criteria. Create a schedule to dispatch a technician to a
          service request.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 sm:pl-6">
                Schedule ID
              </th>
              <th scope="col" className="px-3 py-3.5">
                Service Request
              </th>
              <th scope="col" className="px-3 py-3.5">
                Technician
              </th>
              <th scope="col" className="px-3 py-3.5">
                Scheduled Start
              </th>
              <th scope="col" className="px-3 py-3.5">
                Scheduled End
              </th>
              <th scope="col" className="px-3 py-3.5">
                Status
              </th>
              <th scope="col" className="px-3 py-3.5">
                Notes
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-4 text-right sm:pr-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedules.map((schedule) => {
              const techName = getTechnicianName(schedule.technicianId)
              return (
                <tr
                  key={schedule.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-default"
                >
                  {/* Schedule ID */}
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 font-mono font-bold text-blue-600 sm:pl-6">
                    #{schedule.id}
                  </td>

                  {/* Service Request ID */}
                  <td className="whitespace-nowrap px-3 py-4">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200">
                      Req #{schedule.serviceRequestId}
                    </span>
                  </td>

                  {/* Technician */}
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                        <WrenchIcon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">{techName}</span>
                        <span className="ml-1.5 font-mono text-[10px] text-slate-400">
                          (#{schedule.technicianId})
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Start Time */}
                  <td className="whitespace-nowrap px-3 py-4 text-slate-700 font-medium">
                    {formatDateTime(schedule.scheduledStart)}
                  </td>

                  {/* End Time */}
                  <td className="whitespace-nowrap px-3 py-4 text-slate-700">
                    {formatDateTime(schedule.scheduledEnd)}
                  </td>

                  {/* Status Badge */}
                  <td className="whitespace-nowrap px-3 py-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 border ${
                        statusBadgeStyles[schedule.status] ||
                        'bg-slate-50 text-slate-700 ring-slate-600/20 border-slate-200'
                      }`}
                    >
                      {schedule.status}
                    </span>
                  </td>

                  {/* Notes */}
                  <td className="max-w-[200px] truncate px-3 py-4 text-slate-500 text-[11px]">
                    {schedule.notes || '-'}
                  </td>

                  {/* Action Buttons */}
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right sm:pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<EyeIcon className="h-3.5 w-3.5" />}
                        onClick={() => onViewSchedule(schedule)}
                      >
                        View
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200"
                        leftIcon={<TrashIcon className="h-3.5 w-3.5" />}
                        onClick={() => onDeleteSchedule(schedule)}
                        title="Delete Schedule & set Service to ON_HOLD"
                      >
                        Delete
                      </Button>
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

export default ScheduleTable
