import { type FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import {
  CalendarIcon,
  ClockIcon,
  CloseIcon,
  TicketIcon,
  TrashIcon,
  WrenchIcon,
} from '../icons'
import type { Schedule } from '../../types/schedule'
import type { ServiceRequest } from '../../types/serviceRequest'
import type { Technician } from '../../types/technician'
import scheduleService from '../../services/scheduleService'
import serviceRequestService from '../../services/serviceRequestService'
import technicianService from '../../services/technicianService'
import { useAlertModal } from '../../context/AlertModalContext'

interface ScheduleDetailsModalProps {
  schedule: Schedule | null
  isOpen: boolean
  onClose: () => void
  onScheduleDeleted?: (scheduleId: number) => void
}

const statusBadgeStyles: Record<string, string> = {
  SCHEDULED: 'bg-sky-50 text-sky-700 ring-sky-700/20 border-sky-200',
  DISPATCHED: 'bg-indigo-50 text-indigo-700 ring-indigo-700/20 border-indigo-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-700/20 border-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-700/20 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-rose-700/20 border-rose-200',
}

const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return 'N/A'
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

const calculateDuration = (start?: string, end?: string): string => {
  if (!start || !end) return 'N/A'
  try {
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    const diffMs = e - s
    if (diffMs <= 0) return '0 hrs'
    const diffMins = Math.round(diffMs / (1000 * 60))
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    if (hours === 0) return `${mins} mins`
    if (mins === 0) return `${hours} hrs`
    return `${hours} hrs ${mins} mins`
  } catch {
    return 'N/A'
  }
}

export const ScheduleDetailsModal: FC<ScheduleDetailsModalProps> = ({
  schedule,
  isOpen,
  onClose,
  onScheduleDeleted,
}) => {
  const { confirm } = useAlertModal()
  const [isDeleting, setIsDeleting] = useState(false)
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null)
  const [technician, setTechnician] = useState<Technician | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  useEffect(() => {
    if (!isOpen || !schedule) {
      setServiceRequest(null)
      setTechnician(null)
      return
    }

    let isMounted = true
    setIsLoadingDetails(true)

    // Load related service request and technician info in parallel
    Promise.allSettled([
      serviceRequestService.getServiceRequestById(schedule.serviceRequestId),
      technicianService.getTechnicians(),
    ])
      .then(([reqRes, techRes]) => {
        if (!isMounted) return

        if (reqRes.status === 'fulfilled' && reqRes.value.success && reqRes.value.payload) {
          setServiceRequest(reqRes.value.payload)
        }

        if (techRes.status === 'fulfilled' && techRes.value.success && techRes.value.payload) {
          const list: Technician[] = Array.isArray(techRes.value.payload)
            ? techRes.value.payload
            : []
          const matched = list.find((t) => Number(t.id) === Number(schedule.technicianId))
          if (matched) setTechnician(matched)
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetails(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, schedule])

  // ESC to close
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

  if (!isOpen || !schedule) return null

  const handleDeleteSchedule = async () => {
    const isConfirmed = await confirm({
      title: 'Delete Schedule',
      message:
        'Are you sure you want to delete this schedule? The linked Service Request status will be updated to ON_HOLD.',
      confirmText: 'Delete Schedule',
      cancelText: 'Cancel',
      variant: 'danger',
    })

    if (!isConfirmed) return

    setIsDeleting(true)
    try {
      // 1. Delete the schedule
      const delRes = await scheduleService.deleteSchedule(schedule.id)
      if (!delRes.success && delRes.status !== 204 && delRes.status !== 200) {
        toast.error(delRes.error?.message || 'Failed to delete schedule')
        setIsDeleting(false)
        return
      }

      // 2. Update service request status to ON_HOLD as requested
      try {
        await serviceRequestService.updateServiceRequest(schedule.serviceRequestId, {
          status: 'ON_HOLD',
        })
      } catch (err) {
        console.error('Failed to update service request status to ON_HOLD:', err)
      }

      toast.success('Schedule deleted. Service request status updated to ON_HOLD.')
      if (onScheduleDeleted) {
        onScheduleDeleted(schedule.id)
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error deleting schedule')
    } finally {
      setIsDeleting(false)
    }
  }

  const techDisplayName = technician?.employee
    ? `${technician.employee.firstName || ''} ${technician.employee.lastName || ''}`.trim() ||
      `Technician #${schedule.technicianId}`
    : `Technician #${schedule.technicianId}`

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

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/75 p-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm ring-4 ring-white">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                  Schedule #{schedule.id}
                </h3>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${
                    statusBadgeStyles[schedule.status] ||
                    'bg-slate-50 text-slate-700 ring-slate-600/20'
                  }`}
                >
                  {schedule.status}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Created on {formatDateTime(schedule.createdAt)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Timing Window Card */}
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-900">
              <ClockIcon className="h-4 w-4 text-sky-600" />
              Scheduled Window
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-white p-3 border border-sky-100/80 shadow-2xs">
                <span className="text-[11px] font-medium text-slate-400 uppercase">
                  Start Time
                </span>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatDateTime(schedule.scheduledStart)}
                </p>
              </div>

              <div className="rounded-lg bg-white p-3 border border-sky-100/80 shadow-2xs">
                <span className="text-[11px] font-medium text-slate-400 uppercase">End Time</span>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatDateTime(schedule.scheduledEnd)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <span>Estimated Duration:</span>
              <span className="font-semibold text-slate-900">
                {calculateDuration(schedule.scheduledStart, schedule.scheduledEnd)}
              </span>
            </div>
          </div>

          {/* Assigned Technician Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <WrenchIcon className="h-4 w-4 text-slate-500" />
              Assigned Technician
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-bold text-sm border border-amber-200">
                  <WrenchIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{techDisplayName}</h4>
                  <p className="text-[11px] text-slate-500">
                    Technician ID: #{schedule.technicianId}
                    {technician?.employee?.email ? ` • ${technician.employee.email}` : ''}
                  </p>
                </div>
              </div>
              {technician?.availabilityStatus && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-700">
                  {technician.availabilityStatus}
                </span>
              )}
            </div>
          </div>

          {/* Associated Service Request Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <TicketIcon className="h-4 w-4 text-slate-500" />
                Linked Service Request
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                #{schedule.serviceRequestId}
              </span>
            </div>

            {isLoadingDetails ? (
              <p className="text-xs text-slate-400">Loading service request details...</p>
            ) : serviceRequest ? (
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{serviceRequest.title}</h4>
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {serviceRequest.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {serviceRequest.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Category: {serviceRequest.category}</span>
                  <span>•</span>
                  <span>Priority: {serviceRequest.priority}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Service Request ID: #{schedule.serviceRequestId}
              </p>
            )}
          </div>

          {/* Schedule Notes */}
          {schedule.notes && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Notes / Instructions
              </span>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {schedule.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer with Delete and Close */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/75 px-6 py-4">
          <Button
            type="button"
            variant="danger"
            size="sm"
            leftIcon={<TrashIcon className="h-4 w-4" />}
            onClick={handleDeleteSchedule}
            isLoading={isDeleting}
          >
            Delete Schedule
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ScheduleDetailsModal
