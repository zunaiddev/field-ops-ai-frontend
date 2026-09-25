import { type FC, useEffect, useState, useCallback } from 'react'
import { Button } from '../ui/Button'
import {
  CalendarIcon,
  CloseIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  TicketIcon,
} from '../icons'
import customerPortalService from '../../services/customerPortalService'
import type {
  CustomerAddress,
  CustomerServiceRequest,
  CustomerServiceSchedule,
} from '../../types/publicCustomer'

interface CustomerScheduleModalProps {
  isOpen: boolean
  serviceRequest: CustomerServiceRequest | null
  serviceAddress?: CustomerAddress | null
  onClose: () => void
}

function formatDateTime(dateValue?: string | null): string {
  if (!dateValue) return '—'
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function calculateDuration(start?: string | null, end?: string | null): string {
  if (!start || !end) return '—'
  try {
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    if (isNaN(s) || isNaN(e) || e <= s) return '—'
    const diffMinutes = Math.round((e - s) / (1000 * 60))
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`
    if (hours > 0) return `${hours} hr`
    return `${minutes} min`
  } catch {
    return '—'
  }
}

export const CustomerScheduleModal: FC<CustomerScheduleModalProps> = ({
  isOpen,
  serviceRequest,
  serviceAddress,
  onClose,
}) => {
  const [schedule, setSchedule] = useState<CustomerServiceSchedule | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedule = useCallback(async (serviceId: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await customerPortalService.getServiceSchedule(serviceId)
      if (res.success && res.payload) {
        setSchedule(res.payload)
      } else {
        setSchedule(null)
        setError(res.error?.message || 'Unable to retrieve service schedule.')
      }
    } catch (err) {
      setSchedule(null)
      setError(err instanceof Error ? err.message : 'Error fetching schedule details.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen && serviceRequest) {
      setSchedule(null)
      fetchSchedule(serviceRequest.id)
    } else {
      setSchedule(null)
      setError(null)
    }
  }, [isOpen, serviceRequest, fetchSchedule])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !serviceRequest) return null

  const technicianName = schedule?.technician
    ? schedule.technician.name ||
      `${schedule.technician.firstName || ''} ${schedule.technician.lastName || ''}`.trim() ||
      `Technician #${schedule.technician.id}`
    : 'Assigned Technician'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/75 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm ring-4 ring-white">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  #REQ-{serviceRequest.id}
                </span>
                <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-600/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-600 mr-1.5 animate-pulse" />
                  {schedule?.status || serviceRequest.status || 'SCHEDULED'}
                </span>
              </div>
              <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
                Service Schedule Details
              </h3>
              <p className="text-xs text-slate-500">
                Technician visit has been scheduled for your request.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg
                className="h-8 w-8 animate-spin text-sky-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="mt-3 text-sm font-medium text-slate-600">
                Retrieving schedule and technician info...
              </span>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchSchedule(serviceRequest.id)}
                >
                  Try Again
                </Button>
              </div>
              <p className="text-[11px] text-rose-600">
                If the service was newly scheduled, details might take a few moments to sync.
              </p>
            </div>
          )}

          {/* Schedule Data */}
          {!loading && schedule && (
            <>
              {/* Scheduled Appointment Timing Card */}
              <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50/70 via-white to-sky-50/40 p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-sky-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
                      Appointment Window
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    Est. Duration:{' '}
                    <strong className="text-slate-800">
                      {calculateDuration(schedule.scheduledStart, schedule.scheduledEnd)}
                    </strong>
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="rounded-lg bg-white p-3 border border-sky-100/80 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                      Scheduled Arrival / Start
                    </span>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {formatDateTime(schedule.scheduledStart)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3 border border-sky-100/80 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                      Estimated Completion / End
                    </span>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {formatDateTime(schedule.scheduledEnd)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Technician Profile Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Assigned Field Technician
                  </span>
                  {schedule.technician?.id && (
                    <span className="font-mono text-[11px] text-slate-400">
                      Tech ID #{schedule.technician.id}
                    </span>
                  )}
                </div>

                {schedule.technician ? (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-xs">
                        {(schedule.technician.firstName?.[0] ||
                          schedule.technician.name?.[0] ||
                          'T').toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{technicianName}</h4>
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Confirmed Dispatcher
                        </span>
                      </div>
                    </div>

                    {/* Contact Channels */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {schedule.technician.phone ? (
                        <a
                          href={`tel:${schedule.technician.phone}`}
                          className="flex items-center gap-2.5 rounded-lg border border-slate-200/90 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-colors"
                        >
                          <PhoneIcon className="h-4 w-4 text-sky-600 shrink-0" />
                          <span className="truncate">{schedule.technician.phone}</span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 p-2 text-xs text-slate-400">
                          <PhoneIcon className="h-4 w-4 shrink-0" />
                          <span>No direct phone provided</span>
                        </div>
                      )}

                      {schedule.technician.email ? (
                        <a
                          href={`mailto:${schedule.technician.email}`}
                          className="flex items-center gap-2.5 rounded-lg border border-slate-200/90 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-colors"
                        >
                          <MailIcon className="h-4 w-4 text-sky-600 shrink-0" />
                          <span className="truncate">{schedule.technician.email}</span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 p-2 text-xs text-slate-400">
                          <MailIcon className="h-4 w-4 shrink-0" />
                          <span>No direct email provided</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                    <p className="text-xs text-slate-500">
                      Technician details are being finalized by dispatch.
                    </p>
                  </div>
                )}
              </div>

              {/* Schedule Instructions / Notes */}
              {schedule.notes && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Special Instructions / Notes
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {schedule.notes}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Linked Service Request Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <TicketIcon className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Service Request Summary
              </span>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-slate-900">{serviceRequest.title}</h5>
              {serviceRequest.description && (
                <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                  {serviceRequest.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                Category: {serviceRequest.category}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                Priority: {serviceRequest.priority}
              </span>
            </div>

            {serviceAddress && (
              <div className="flex items-start gap-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <MapPinIcon className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>
                  {serviceAddress.addressLine1}, {serviceAddress.city}, {serviceAddress.state}{' '}
                  {serviceAddress.postalCode}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/75 px-6 py-4">
          <span className="text-xs text-slate-400">
            {schedule?.id ? `Schedule ID #${schedule.id}` : ''}
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CustomerScheduleModal
