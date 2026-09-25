import { type FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { CalendarIcon, CloseIcon, TicketIcon, WrenchIcon } from '../icons'
import type { Schedule, CreateSchedulePayload } from '../../types/schedule'
import type { ServiceRequest } from '../../types/serviceRequest'
import type { Technician } from '../../types/technician'
import scheduleService from '../../services/scheduleService'
import serviceRequestService from '../../services/serviceRequestService'
import technicianService from '../../services/technicianService'

interface CreateScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onScheduleCreated: (newSchedule: Schedule) => void
  initialServiceRequestId?: number
}

interface FormValues {
  serviceRequestId: number | string
  technicianId: number | string
  scheduledStart: string
  scheduledEnd: string
  notes: string
}

// Format Date to YYYY-MM-DDTHH:mm for datetime-local input
const toLocalDateTimeInput = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const yyyy = date.getFullYear()
  const MM = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`
}

export const CreateScheduleModal: FC<CreateScheduleModalProps> = ({
  isOpen,
  onClose,
  onScheduleCreated,
  initialServiceRequestId,
}) => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false)

  const defaultStartTime = () => {
    const d = new Date()
    d.setHours(d.getHours() + 1, 0, 0, 0)
    return toLocalDateTimeInput(d)
  }

  const defaultEndTime = () => {
    const d = new Date()
    d.setHours(d.getHours() + 3, 0, 0, 0)
    return toLocalDateTimeInput(d)
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      serviceRequestId: initialServiceRequestId || '',
      technicianId: '',
      scheduledStart: defaultStartTime(),
      scheduledEnd: defaultEndTime(),
      notes: '',
    },
  })

  const selectedServiceRequestId = watch('serviceRequestId')

  useEffect(() => {
    if (!isOpen) return

    reset({
      serviceRequestId: initialServiceRequestId || '',
      technicianId: '',
      scheduledStart: defaultStartTime(),
      scheduledEnd: defaultEndTime(),
      notes: '',
    })

    // Load technicians
    setIsLoadingTechnicians(true)
    technicianService
      .getTechnicians()
      .then((res) => {
        if (res.success && res.payload) {
          setTechnicians(res.payload)
          if (res.payload.length > 0) {
            setValue('technicianId', res.payload[0].id)
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load technicians:', err)
      })
      .finally(() => {
        setIsLoadingTechnicians(false)
      })

    // Load candidate service requests
    setIsLoadingRequests(true)
    serviceRequestService
      .getServiceRequests({ page: 1, pageSize: 100 })
      .then((res) => {
        if (res.success && res.payload) {
          let list: ServiceRequest[] = []
          if (Array.isArray(res.payload)) {
            list = res.payload
          } else if (res.payload.data && Array.isArray(res.payload.data)) {
            list = res.payload.data
          }
          setServiceRequests(list)
          if (!initialServiceRequestId && list.length > 0) {
            setValue('serviceRequestId', list[0].id)
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load service requests:', err)
      })
      .finally(() => {
        setIsLoadingRequests(false)
      })
  }, [isOpen, initialServiceRequestId, reset, setValue])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const onSubmit = async (values: FormValues) => {
    const sId = Number(values.serviceRequestId)
    const tId = Number(values.technicianId)

    if (!sId || isNaN(sId)) {
      toast.error('Please select a valid Service Request')
      return
    }

    if (!tId || isNaN(tId)) {
      toast.error('Please select a valid Technician')
      return
    }

    const startDate = new Date(values.scheduledStart)
    const endDate = new Date(values.scheduledEnd)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast.error('Please enter valid start and end dates')
      return
    }

    if (endDate <= startDate) {
      toast.error('Scheduled end time must be after scheduled start time')
      return
    }

    try {
      const payload: CreateSchedulePayload = {
        serviceRequestId: sId,
        technicianId: tId,
        scheduledStart: startDate.toISOString(),
        scheduledEnd: endDate.toISOString(),
        notes: values.notes?.trim() || undefined,
      }

      const res = await scheduleService.createSchedule(payload)
      if (res.success && res.payload) {
        toast.success('Schedule created successfully!')
        onScheduleCreated(res.payload)
        onClose()
      } else {
        toast.error(res.error?.message || 'Failed to create schedule')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error creating schedule')
    }
  }

  if (!isOpen) return null

  const selectedService = serviceRequests.find(
    (r) => Number(r.id) === Number(selectedServiceRequestId),
  )

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
      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/75 p-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm ring-4 ring-white">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Create Schedule
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Assign a technician and schedule a time window for a service request.
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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-4 flex-1">
            {/* Service Request Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <TicketIcon className="h-3.5 w-3.5 text-slate-500" />
                Service Request <span className="text-rose-500">*</span>
              </label>

              {initialServiceRequestId ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-xs">
                  <span className="font-bold text-blue-900">
                    Service Request #{initialServiceRequestId}
                  </span>
                  {selectedService && (
                    <p className="text-slate-600 mt-0.5 truncate">{selectedService.title}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <select
                    {...register('serviceRequestId', { required: 'Service Request is required' })}
                    disabled={isLoadingRequests}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:bg-slate-50"
                  >
                    <option value="">-- Select a Service Request --</option>
                    {serviceRequests.map((req) => (
                      <option key={req.id} value={req.id}>
                        #{req.id} - {req.title} [{req.status}]
                      </option>
                    ))}
                  </select>
                  {errors.serviceRequestId && (
                    <p className="text-xs text-rose-600">{errors.serviceRequestId.message}</p>
                  )}
                </div>
              )}

              {selectedService && (
                <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{selectedService.title}</span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono uppercase">
                      {selectedService.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {selectedService.description}
                  </p>
                </div>
              )}
            </div>

            {/* Technician Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <WrenchIcon className="h-3.5 w-3.5 text-slate-500" />
                Technician <span className="text-rose-500">*</span>
              </label>

              <select
                {...register('technicianId', { required: 'Technician is required' })}
                disabled={isLoadingTechnicians}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:bg-slate-50"
              >
                <option value="">-- Select a Technician --</option>
                {technicians.map((tech) => {
                  const techName = tech.employee
                    ? `${tech.employee.firstName || ''} ${tech.employee.lastName || ''}`.trim() ||
                      `Technician #${tech.id}`
                    : `Technician #${tech.id}`
                  return (
                    <option key={tech.id} value={tech.id}>
                      {techName} (ID: #{tech.id}) - {tech.availabilityStatus || tech.status}
                    </option>
                  )
                })}
              </select>
              {errors.technicianId && (
                <p className="mt-1 text-xs text-rose-600">{errors.technicianId.message}</p>
              )}
            </div>

            {/* Scheduled Start & End Time */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Scheduled Start <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...register('scheduledStart', { required: 'Start time is required' })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                />
                {errors.scheduledStart && (
                  <p className="mt-1 text-xs text-rose-600">{errors.scheduledStart.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Scheduled End <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...register('scheduledEnd', { required: 'End time is required' })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                />
                {errors.scheduledEnd && (
                  <p className="mt-1 text-xs text-rose-600">{errors.scheduledEnd.message}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Notes / Instructions <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Special instructions, entry instructions, or required equipment..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                {...register('notes')}
              />
            </div>
          </div>

          {/* Footer */}
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
            >
              Create Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateScheduleModal
