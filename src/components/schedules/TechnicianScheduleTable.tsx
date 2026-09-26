import { type FC } from 'react'
import { Button } from '../ui/Button'
import {
  CalendarIcon,
  EyeIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  MailIcon,
  TicketIcon,
} from '../icons'
import type { Schedule } from '../../types/schedule'

interface TechnicianScheduleTableProps {
  schedules: Schedule[]
  onViewSchedule: (schedule: Schedule) => void
  onUpdateSchedule: (schedule: Schedule) => void
}

const statusBadgeStyles: Record<string, string> = {
  SCHEDULED: 'bg-sky-50 text-sky-700 ring-sky-700/20 border-sky-200',
  DISPATCHED: 'bg-indigo-50 text-indigo-700 ring-indigo-700/20 border-indigo-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-700/20 border-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-700/20 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-rose-700/20 border-rose-200',
}

const priorityBadgeStyles: Record<string, string> = {
  URGENT: 'bg-red-50 text-red-700 border-red-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  LOW: 'bg-slate-50 text-slate-700 border-slate-200',
}

const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return dateStr
  }
}

export const TechnicianScheduleTable: FC<TechnicianScheduleTableProps> = ({
  schedules,
  onViewSchedule,
  onUpdateSchedule,
}) => {
  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
          <CalendarIcon className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">No assigned schedules</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          You currently have no service schedules assigned to you matching your filter.
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
                Schedule ID & Status
              </th>
              <th scope="col" className="px-3 py-3.5">
                Service Request
              </th>
              <th scope="col" className="px-3 py-3.5">
                Customer & Contact
              </th>
              <th scope="col" className="px-3 py-3.5">
                Site Address
              </th>
              <th scope="col" className="px-3 py-3.5">
                Scheduled Window
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
              const isCancelled = schedule.status === 'CANCELLED'
              const cust = schedule.customer
              const addr = schedule.address
              const req = schedule.serviceRequest

              const addressLine = addr
                ? [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.postalCode]
                    .filter(Boolean)
                    .join(', ')
                : null

              const mapsUrl = addressLine
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`
                : null

              return (
                <tr
                  key={schedule.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-default"
                >
                  {/* Schedule ID & Status */}
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                    <div className="space-y-1">
                      <div className="font-mono font-bold text-blue-600">
                        #{schedule.id}
                      </div>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 border ${
                          statusBadgeStyles[schedule.status] ||
                          'bg-slate-50 text-slate-700 ring-slate-600/20 border-slate-200'
                        }`}
                      >
                        {schedule.status}
                      </span>
                    </div>
                  </td>

                  {/* Service Request info */}
                  <td className="px-3 py-4 max-w-[220px]">
                    {req ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900 line-clamp-1" title={req.title}>
                          {req.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            Req #{schedule.serviceRequestId}
                          </span>
                          {req.priority && (
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] font-semibold border ${
                                priorityBadgeStyles[req.priority] || 'bg-slate-50 text-slate-700'
                              }`}
                            >
                              {req.priority}
                            </span>
                          )}
                          {req.category && (
                            <span className="rounded bg-blue-50 px-1.5 py-0.2 text-[10px] font-medium text-blue-700">
                              {req.category}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <TicketIcon className="h-3.5 w-3.5 text-slate-400" />
                        <span>Req #{schedule.serviceRequestId}</span>
                      </div>
                    )}
                  </td>

                  {/* Customer info */}
                  <td className="px-3 py-4 max-w-[180px]">
                    {cust ? (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900 truncate" title={cust.name}>
                          {cust.name}
                        </div>
                        {cust.phone && (
                          <div>
                            <a
                              href={`tel:${cust.phone}`}
                              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <PhoneIcon className="h-3 w-3 shrink-0" />
                              <span className="truncate">{cust.phone}</span>
                            </a>
                          </div>
                        )}
                        {cust.email && (
                          <div>
                            <a
                              href={`mailto:${cust.email}`}
                              className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-800 hover:underline truncate"
                              title={cust.email}
                            >
                              <MailIcon className="h-3 w-3 shrink-0" />
                              <span className="truncate">{cust.email}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Address */}
                  <td className="px-3 py-4 max-w-[200px]">
                    {addressLine ? (
                      <div className="space-y-1">
                        <p className="text-slate-700 line-clamp-2" title={addressLine}>
                          {addressLine}
                        </p>
                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
                          >
                            <MapPinIcon className="h-3 w-3 shrink-0" />
                            Open Map
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Scheduled Window */}
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="space-y-0.5">
                      <div className="font-medium text-slate-800">
                        {formatDateTime(schedule.scheduledStart)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        to {formatDateTime(schedule.scheduledEnd)}
                      </div>
                    </div>
                  </td>

                  {/* Notes */}
                  <td className="max-w-[160px] truncate px-3 py-4 text-slate-500 text-[11px]" title={schedule.notes || undefined}>
                    {schedule.notes || '-'}
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right sm:pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Update status button */}
                      <Button
                        type="button"
                        variant={isCancelled ? 'outline' : 'primary'}
                        size="sm"
                        leftIcon={<PencilIcon className="h-3.5 w-3.5" />}
                        onClick={() => onUpdateSchedule(schedule)}
                        className={isCancelled ? 'text-slate-400 border-slate-200' : ''}
                        title={
                          isCancelled
                            ? 'Schedule is cancelled and cannot be updated'
                            : 'Update schedule status & notes'
                        }
                      >
                        Update
                      </Button>

                      {/* View details button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<EyeIcon className="h-3.5 w-3.5" />}
                        onClick={() => onViewSchedule(schedule)}
                        title="View complete details"
                      >
                        Details
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

export default TechnicianScheduleTable
