import { type FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { CloseIcon, ClockIcon, MapPinIcon, TicketIcon, UsersIcon } from '../icons'
import type { Schedule, ScheduleStatus } from '../../types/schedule'
import scheduleService from '../../services/scheduleService'

interface UpdateTechnicianScheduleModalProps {
  schedule: Schedule | null
  isOpen: boolean
  onClose: () => void
  onScheduleUpdated: (updatedSchedule: Schedule) => void
}

const statusOptions: { value: ScheduleStatus; label: string; description: string }[] = [
  { value: 'SCHEDULED', label: 'Scheduled', description: 'Assigned and scheduled for service' },
  { value: 'DISPATCHED', label: 'Dispatched', description: 'Technician dispatched or en route to site' },
  { value: 'IN_PROGRESS', label: 'In Progress', description: 'Technician on site, actively working' },
  { value: 'COMPLETED', label: 'Completed', description: 'Job finished and verified' },
  { value: 'CANCELLED', label: 'Cancelled', description: 'Appointment cancelled' },
]

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

export const UpdateTechnicianScheduleModal: FC<UpdateTechnicianScheduleModalProps> = ({
  schedule,
  isOpen,
  onClose,
  onScheduleUpdated,
}) => {
  const [status, setStatus] = useState<ScheduleStatus>('SCHEDULED')
  const [notes, setNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isCancelled = schedule?.status === 'CANCELLED'

  useEffect(() => {
    if (schedule && isOpen) {
      setStatus(schedule.status || 'SCHEDULED')
      setNotes(schedule.notes || '')
      setErrorMessage(null)
    }
  }, [schedule, isOpen])

  // ESC to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen || !schedule) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isCancelled) {
      toast.error('Cancelled schedules cannot be updated.')
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const res = await scheduleService.updateTechnicianScheduleStatus(schedule.id, {
        status,
        notes: notes.trim() ? notes.trim() : undefined,
      })

      if (res.success && res.payload) {
        toast.success(`Schedule #${schedule.id} updated to ${status}`)
        // Preserve any customer/address/serviceRequest nested data from existing schedule if backend didn't re-include it
        const merged: Schedule = {
          ...schedule,
          ...res.payload,
          customer: res.payload.customer || schedule.customer,
          address: res.payload.address || schedule.address,
          serviceRequest: res.payload.serviceRequest || schedule.serviceRequest,
        }
        onScheduleUpdated(merged)
        onClose()
      } else {
        const errorMsg =
          res.error?.message ||
          (res.status === 400
            ? 'This schedule cannot be updated in its current status.'
            : 'Failed to update schedule status')
        setErrorMessage(errorMsg)
        toast.error(errorMsg)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error updating schedule status'
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Address summary
  const addr = schedule.address
  const formattedAddress = addr
    ? [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.postalCode]
        .filter(Boolean)
        .join(', ')
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/75 p-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Update Schedule #{schedule.id}
              </h3>
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${
                  statusBadgeStyles[schedule.status] ||
                  'bg-slate-50 text-slate-700 ring-slate-600/20'
                }`}
              >
                Current: {schedule.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Update appointment progress and add field execution notes.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-4 flex-1">
            {/* Business Rule Banner: CANCELLED */}
            {isCancelled && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                <div className="font-semibold text-rose-900 mb-1">
                  Schedule Not Updatable
                </div>
                This schedule has already been cancelled. According to system rules, cancelled schedules cannot have their status or notes modified.
              </div>
            )}

            {/* Error Message if any */}
            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {errorMessage}
              </div>
            )}

            {/* Job Summary Banner */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2 text-xs">
              {/* Linked Service Request */}
              {schedule.serviceRequest ? (
                <div className="flex items-start gap-2">
                  <TicketIcon className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">
                      {schedule.serviceRequest.title}
                    </span>
                    <span className="ml-1 text-[11px] text-slate-500">
                      (Req #{schedule.serviceRequestId})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <TicketIcon className="h-4 w-4 text-blue-600" />
                  <span>Service Request #{schedule.serviceRequestId}</span>
                </div>
              )}

              {/* Customer */}
              {schedule.customer && (
                <div className="flex items-center gap-2 text-slate-600">
                  <UsersIcon className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    <strong>Customer:</strong> {schedule.customer.name}
                    {schedule.customer.phone ? ` • ${schedule.customer.phone}` : ''}
                  </span>
                </div>
              )}

              {/* Address */}
              {formattedAddress && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPinIcon className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{formattedAddress}</span>
                </div>
              )}

              {/* Scheduled window */}
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <ClockIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>
                  {formatDateTime(schedule.scheduledStart)} - {formatDateTime(schedule.scheduledEnd)}
                </span>
              </div>
            </div>

            {/* Status Select Field */}
            <div className="space-y-1.5">
              <label htmlFor="schedule-status-select" className="block text-xs font-semibold text-slate-700">
                New Status <span className="text-rose-500">*</span>
              </label>
              <Select
                id="schedule-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ScheduleStatus)}
                disabled={isCancelled || isSubmitting}
                options={statusOptions.map((opt) => ({
                  value: opt.value,
                  label: `${opt.label} - ${opt.description}`,
                }))}
              />
            </div>

            {/* Status Quick Pills */}
            {!isCancelled && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {statusOptions.map((opt) => {
                  const isSelected = status === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setStatus(opt.value)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors border cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-600/30'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Notes / Progress Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="schedule-notes-textarea" className="block text-xs font-semibold text-slate-700">
                  Technician Notes / Work Summary
                </label>
                <span className="text-[11px] text-slate-400">Optional</span>
              </div>
              <textarea
                id="schedule-notes-textarea"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isCancelled || isSubmitting}
                placeholder="e.g., Replaced fuse and tested HVAC cooling unit. Working properly at 68°F. Customer signed off."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:text-slate-400"
              />
              <p className="text-[11px] text-slate-500">
                Notes will be visible to dispatchers and saved to the job record.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/75 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={isCancelled || isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateTechnicianScheduleModal
