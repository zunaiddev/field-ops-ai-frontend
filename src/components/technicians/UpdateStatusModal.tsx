import { useState, useEffect, type FC, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { CloseIcon, WrenchIcon } from '../icons'
import technicianService from '../../services/technicianService'
import type { Technician } from '../../types/technician'

export const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' },
]

export const AVAILABILITY_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available (Ready for assignment)' },
  { value: 'ON_JOB', label: 'On Job (Currently assigned)' },
  { value: 'ON_BREAK', label: 'On Break' },
  { value: 'UNAVAILABLE', label: 'Unavailable / Off Duty' },
]

interface UpdateStatusModalProps {
  isOpen: boolean
  technician: Technician | null
  onClose: () => void
  onStatusUpdated: (updatedPartial: {
    id: number
    status: string
    availabilityStatus: string
    updatedAt?: string
  }) => void
}

export const UpdateStatusModal: FC<UpdateStatusModalProps> = ({
  isOpen,
  technician,
  onClose,
  onStatusUpdated,
}) => {
  const [status, setStatus] = useState<string>('ACTIVE')
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('AVAILABLE')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form when technician or isOpen changes
  useEffect(() => {
    if (technician && isOpen) {
      setStatus(technician.status || 'ACTIVE')
      setAvailabilityStatus(technician.availabilityStatus || 'AVAILABLE')
      setIsSubmitting(false)
    }
  }, [technician, isOpen])

  // Escape key listener
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

  if (!isOpen || !technician) return null

  const emp = technician.employee
  const technicianName = emp
    ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email
    : `Technician #${technician.id}`

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!status) {
      toast.error('Please select a status')
      return
    }

    if (!availabilityStatus) {
      toast.error('Please select an availability status')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await technicianService.updateTechnicianStatus(technician.id, {
        status,
        availabilityStatus,
      })

      if (res.success && res.payload) {
        toast.success(`Status updated successfully for ${technicianName}`)
        onStatusUpdated({
          id: technician.id,
          status: res.payload.status,
          availabilityStatus: res.payload.availabilityStatus,
          updatedAt: res.payload.updatedAt,
        })
        onClose()
      } else {
        toast.error(res.error?.message || 'Failed to update technician status')
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An error occurred while updating status',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/75 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <WrenchIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-slate-900">
                  Update Status
                </h3>
                <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  #{technician.id}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 truncate max-w-[240px]">
                {technicianName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-5 space-y-4">
            {/* Status Select */}
            <div>
              <Select
                label="Account Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={STATUS_OPTIONS}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Availability Status Select */}
            <div>
              <Select
                label="Availability Status"
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                options={AVAILABILITY_OPTIONS}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Live Preview */}
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-2">
                New Status Preview:
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                      : status === 'SUSPENDED'
                      ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                      : 'bg-slate-100 text-slate-600 ring-1 ring-slate-600/10'
                  }`}
                >
                  {status}
                </span>

                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    availabilityStatus === 'AVAILABLE'
                      ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20'
                      : availabilityStatus === 'ON_JOB'
                      ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                      : availabilityStatus === 'ON_BREAK'
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                      : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                  }`}
                >
                  {availabilityStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/75 px-5 py-3.5">
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
            >
              Update Status
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateStatusModal
