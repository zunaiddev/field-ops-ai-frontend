import { type FC, useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import {
  CloseIcon,
  MapPinIcon,
  UsersIcon,
  EyeIcon,
  BuildingIcon,
  TicketIcon,
  PencilIcon,
  CalendarIcon,
  TrashIcon,
} from '../icons'
import type { ServiceRequest } from '../../types/serviceRequest'
import type { Customer, CustomerAddressRes } from '../../types/customer'
import type { Employee } from '../../types/organization'
import type { Schedule } from '../../types/schedule'
import type { Technician } from '../../types/technician'
import {
  statusBadgeStyles,
  priorityBadgeStyles,
  categoryBadgeStyles,
  sourceBadgeStyles,
} from './ServiceRequestTable'
import customerService from '../../services/customerService'
import dashboardService from '../../services/dashboardService'
import scheduleService from '../../services/scheduleService'
import serviceRequestService from '../../services/serviceRequestService'
import technicianService from '../../services/technicianService'
import { useAlertModal } from '../../context/AlertModalContext'

interface ServiceRequestDetailsModalProps {
  isOpen: boolean
  request: ServiceRequest | null
  onClose: () => void
  onEditRequest?: (request: ServiceRequest) => void
  onRequestUpdated?: (request: ServiceRequest) => void
  onOpenScheduleModal?: (serviceRequestId: number) => void
}

const roleBadgeStyles: Record<string, { bg: string; text: string; label: string }> = {
  OWNER: { bg: 'bg-blue-50 text-blue-700 ring-blue-700/20', label: 'Owner', text: 'text-blue-700' },
  ORG_OWNER: { bg: 'bg-blue-50 text-blue-700 ring-blue-700/20', label: 'Owner', text: 'text-blue-700' },
  ADMIN: { bg: 'bg-indigo-50 text-indigo-700 ring-indigo-700/20', label: 'Admin', text: 'text-indigo-700' },
  ORG_ADMIN: { bg: 'bg-indigo-50 text-indigo-700 ring-indigo-700/20', label: 'Admin', text: 'text-indigo-700' },
  MANAGER: { bg: 'bg-violet-50 text-violet-700 ring-violet-700/20', label: 'Manager', text: 'text-violet-700' },
  EMPLOYEE: { bg: 'bg-slate-100 text-slate-700 ring-slate-600/20', label: 'Field Tech', text: 'text-slate-700' },
  TECHNICIAN: { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-700/20', label: 'Technician', text: 'text-emerald-700' },
  DISPATCHER: { bg: 'bg-cyan-50 text-cyan-700 ring-cyan-700/20', label: 'Dispatcher', text: 'text-cyan-700' },
  INVENTORY_MANAGER: { bg: 'bg-amber-50 text-amber-700 ring-amber-600/20', label: 'Inventory Manager', text: 'text-amber-700' },
  FINANCE: { bg: 'bg-teal-50 text-teal-700 ring-teal-700/20', label: 'Finance', text: 'text-teal-700' },
  VIEWER: { bg: 'bg-slate-100 text-slate-700 ring-slate-600/20', label: 'Viewer', text: 'text-slate-700' },
}

const employeeStatusStyles: Record<string, { bg: string; dot: string }> = {
  ACTIVE: { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-600' },
  INACTIVE: { bg: 'bg-slate-100 text-slate-600 ring-slate-500/20', dot: 'bg-slate-500' },
  PENDING: { bg: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-600' },
  SUSPENDED: { bg: 'bg-rose-50 text-rose-700 ring-rose-600/20', dot: 'bg-rose-600' },
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

function formatDateTime(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return '—'
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleString(undefined, {
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

export const ServiceRequestDetailsModal: FC<ServiceRequestDetailsModalProps> = ({
  isOpen,
  request,
  onClose,
  onEditRequest,
  onRequestUpdated,
  onOpenScheduleModal,
}) => {
  const { confirm } = useAlertModal()

  // Local synced copy of request
  const [currentRequest, setCurrentRequest] = useState<ServiceRequest | null>(request)

  // Customer fetch state
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loadingCustomer, setLoadingCustomer] = useState(false)
  const [customerError, setCustomerError] = useState<string | null>(null)

  // Address fetch state
  const [address, setAddress] = useState<CustomerAddressRes | null>(null)
  const [allAddresses, setAllAddresses] = useState<CustomerAddressRes[]>([])
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)

  // Employee creator details state
  const [creatorEmployee, setCreatorEmployee] = useState<Employee | null>(null)
  const [loadingCreator, setLoadingCreator] = useState(false)
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false)

  // Schedule fetch state
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [assignedTechnician, setAssignedTechnician] = useState<Technician | null>(null)
  const [isDeletingSchedule, setIsDeletingSchedule] = useState(false)

  // Fetch Customer Details
  const fetchCustomerDetails = useCallback(async (customerId: number | string) => {
    setLoadingCustomer(true)
    setCustomerError(null)
    try {
      const res = await customerService.getCustomerById(customerId)
      if (res.success && res.payload) {
        setCustomer(res.payload)
      } else {
        setCustomerError(res.error?.message || `Customer #${customerId} not found`)
      }
    } catch (err) {
      setCustomerError(
        err instanceof Error ? err.message : 'Error fetching customer information',
      )
    } finally {
      setLoadingCustomer(false)
    }
  }, [])

  // Fetch Address Details for Customer / Address ID
  const fetchAddressDetails = useCallback(
    async (customerId: number | string, targetAddressId?: number | null) => {
      setLoadingAddress(true)
      setAddressError(null)
      try {
        const res = await customerService.getCustomerAddresses(customerId)
        if (res.success && res.payload) {
          let list: CustomerAddressRes[] = []
          if (Array.isArray(res.payload)) {
            list = res.payload
          } else if (
            typeof res.payload === 'object' &&
            'data' in res.payload &&
            Array.isArray(res.payload.data)
          ) {
            list = res.payload.data
          }
          setAllAddresses(list)

          if (targetAddressId) {
            const found = list.find((a) => Number(a.id) === Number(targetAddressId))
            setAddress(found || list[0] || null)
          } else if (list.length > 0) {
            const primary = list.find((a) => a.isPrimary) || list[0]
            setAddress(primary)
          } else {
            setAddress(null)
          }
        } else {
          setAddressError(res.error?.message || 'No address records found')
        }
      } catch (err) {
        setAddressError(
          err instanceof Error ? err.message : 'Error retrieving address information',
        )
      } finally {
        setLoadingAddress(false)
      }
    },
    [],
  )

  // Fetch Schedule for Service Request
  const fetchScheduleDetails = useCallback(async (serviceId: number | string) => {
    setLoadingSchedule(true)
    setScheduleError(null)
    setAssignedTechnician(null)
    try {
      const res = await scheduleService.getScheduleByServiceId(serviceId)
      if (res.success && res.payload) {
        setSchedule(res.payload)

        // Try to fetch technician details for richer display
        if (res.payload.technicianId) {
          try {
            const techRes = await technicianService.getTechnicians()
            if (techRes.success && techRes.payload) {
              const techList: Technician[] = Array.isArray(techRes.payload)
                ? techRes.payload
                : []
              const found = techList.find(
                (t) => Number(t.id) === Number(res.payload?.technicianId),
              )
              if (found) setAssignedTechnician(found)
            }
          } catch {
            // Non-critical, ignore
          }
        }
      } else {
        setSchedule(null)
        setScheduleError(res.error?.message || 'No active schedule found')
      }
    } catch (err) {
      setSchedule(null)
      setScheduleError(err instanceof Error ? err.message : 'Error loading schedule')
    } finally {
      setLoadingSchedule(false)
    }
  }, [])

  // Delete Schedule & set service status to ON_HOLD
  const handleDeleteSchedule = async () => {
    if (!schedule || !currentRequest) return

    const confirmed = await confirm({
      title: 'Delete Service Schedule',
      message: `Are you sure you want to delete this schedule? The service request status will be updated to ON_HOLD.`,
      confirmText: 'Delete Schedule',
      cancelText: 'Cancel',
      variant: 'danger',
    })

    if (!confirmed) return

    setIsDeletingSchedule(true)
    try {
      // 1. Delete the schedule
      const delRes = await scheduleService.deleteSchedule(schedule.id)
      if (!delRes.success) {
        toast.error(delRes.error?.message || 'Failed to delete schedule')
        return
      }

      // 2. Update service request status to ON_HOLD
      const updateRes = await serviceRequestService.updateServiceRequest(currentRequest.id, {
        status: 'ON_HOLD',
      })

      const updatedRequest: ServiceRequest =
        updateRes.success && updateRes.payload
          ? (updateRes.payload as ServiceRequest)
          : { ...currentRequest, status: 'ON_HOLD' }

      setCurrentRequest(updatedRequest)
      setSchedule(null)
      setAssignedTechnician(null)
      onRequestUpdated?.(updatedRequest)

      toast.success('Schedule deleted. Service request status updated to ON_HOLD.')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An error occurred while deleting schedule',
      )
    } finally {
      setIsDeletingSchedule(false)
    }
  }

  // Fetch Employee Creator on demand when button clicked
  const handleFetchCreatorEmployee = async (employeeId: number | string) => {
    setLoadingCreator(true)
    try {
      const res = await dashboardService.getMemberById(employeeId)
      if (res.success && res.payload) {
        setCreatorEmployee(res.payload)
        setIsCreatorModalOpen(true)
      } else {
        toast.error(
          res.error?.message || `Failed to fetch employee details for ID #${employeeId}`,
        )
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An error occurred while fetching employee info',
      )
    } finally {
      setLoadingCreator(false)
    }
  }

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && request) {
      setCurrentRequest(request)
      setCustomer(null)
      setAddress(null)
      setAllAddresses([])
      setCreatorEmployee(null)
      setIsCreatorModalOpen(false)
      setSchedule(null)
      setAssignedTechnician(null)

      if (request.customerId) {
        fetchCustomerDetails(request.customerId)
        fetchAddressDetails(request.customerId, request.addressId)
      }

      if (request.status?.toUpperCase() === 'SCHEDULED') {
        fetchScheduleDetails(request.id)
      }
    } else {
      setCurrentRequest(null)
      setCustomer(null)
      setAddress(null)
      setAllAddresses([])
      setCreatorEmployee(null)
      setIsCreatorModalOpen(false)
      setSchedule(null)
      setAssignedTechnician(null)
    }
  }, [isOpen, request, fetchCustomerDetails, fetchAddressDetails, fetchScheduleDetails])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCreatorModalOpen) {
          setIsCreatorModalOpen(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isCreatorModalOpen, onClose])

  if (!isOpen || !currentRequest) return null

  const statusCfg = statusBadgeStyles[currentRequest.status] || {
    bg: 'bg-slate-100 ring-slate-500/20',
    text: 'text-slate-600',
    dot: 'bg-slate-500',
    label: currentRequest.status,
  }

  const priorityCfg = priorityBadgeStyles[currentRequest.priority] || {
    bg: 'bg-slate-100 text-slate-700 ring-slate-600/20',
    text: 'text-slate-700',
    label: currentRequest.priority,
  }

  const categoryCfg = categoryBadgeStyles[currentRequest.category] || {
    bg: 'bg-slate-100 ring-slate-600/20',
    text: 'text-slate-700',
  }

  const sourceCfg = sourceBadgeStyles[currentRequest.source] || {
    bg: 'bg-slate-100 text-slate-700 ring-slate-600/20',
    text: 'text-slate-700',
    label: currentRequest.source,
  }

  const isEmployeeSource = currentRequest.source?.toUpperCase() === 'EMPLOYEE'
  const isScheduled = currentRequest.status?.toUpperCase() === 'SCHEDULED'

  const techDisplayName = assignedTechnician?.employee
    ? `${assignedTechnician.employee.firstName || ''} ${assignedTechnician.employee.lastName || ''}`.trim() ||
      `Technician #${schedule?.technicianId}`
    : `Technician ID #${schedule?.technicianId}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Main Modal Box */}
      <div className="relative z-10 w-full max-w-4xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/75 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm ring-4 ring-white">
              <TicketIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  #REQ-{currentRequest.id}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  {currentRequest.title}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusCfg.bg} ${statusCfg.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${priorityCfg.bg}`}
                >
                  Priority: {priorityCfg.label}
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${categoryCfg.bg} ${categoryCfg.text}`}
                >
                  {currentRequest.category}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Created on {formatDateTime(currentRequest.createdAt)}
                {currentRequest.updatedAt && currentRequest.updatedAt !== currentRequest.createdAt && (
                  <span className="ml-2 font-mono text-slate-400">
                    (Updated {formatDateTime(currentRequest.updatedAt)})
                  </span>
                )}
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

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* SECTION: ACTIVE SCHEDULE (Visible when status is SCHEDULED) */}
          {isScheduled && (
            <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white shadow-2xs">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900">
                      Active Schedule Details
                    </h4>
                    <p className="text-[11px] text-sky-700">
                      This service request is currently scheduled for dispatch.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchScheduleDetails(currentRequest.id)}
                    className="text-xs font-medium text-sky-700 hover:text-sky-800 hover:underline cursor-pointer"
                  >
                    Refresh
                  </button>
                  {schedule && (
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<TrashIcon className="h-3.5 w-3.5" />}
                      onClick={handleDeleteSchedule}
                      isLoading={isDeletingSchedule}
                      title="Delete this schedule and set status to ON_HOLD"
                    >
                      Delete Schedule
                    </Button>
                  )}
                </div>
              </div>

              {loadingSchedule && (
                <div className="mt-3 flex items-center justify-center rounded-lg border border-dashed border-sky-200 bg-white/70 p-5 text-center">
                  <svg className="h-5 w-5 animate-spin text-sky-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="ml-2.5 text-xs font-medium text-slate-600">
                    Retrieving schedule details...
                  </span>
                </div>
              )}

              {!loadingSchedule && schedule && (
                <div className="mt-3 rounded-lg border border-sky-100 bg-white p-4 shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        Schedule #{schedule.id}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-600/20">
                        {schedule.status}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-500">
                      Duration:{' '}
                      <strong className="text-slate-800">
                        {calculateDuration(schedule.scheduledStart, schedule.scheduledEnd)}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Scheduled Start</span>
                      <p className="mt-0.5 font-semibold text-slate-800 font-mono">
                        {formatDateTime(schedule.scheduledStart)}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Scheduled End</span>
                      <p className="mt-0.5 font-semibold text-slate-800 font-mono">
                        {formatDateTime(schedule.scheduledEnd)}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Assigned Technician</span>
                      <p className="mt-0.5 font-semibold text-slate-800">
                        {techDisplayName}
                      </p>
                      {assignedTechnician?.employee?.email && (
                        <p className="text-[11px] text-slate-500">{assignedTechnician.employee.email}</p>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Technician Status</span>
                      <p className="mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-600/20">
                          {assignedTechnician?.availabilityStatus || assignedTechnician?.status || 'Scheduled'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {schedule.notes && (
                    <div className="rounded-md bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-100">
                      <span className="font-semibold text-slate-600 block mb-0.5">Schedule Notes:</span>
                      {schedule.notes}
                    </div>
                  )}
                </div>
              )}

              {!loadingSchedule && !schedule && (
                <div className="mt-3 rounded-lg border border-dashed border-sky-200 bg-white/70 p-3 text-xs text-sky-800 text-center">
                  {scheduleError || 'Schedule details could not be retrieved from the server.'}
                </div>
              )}
            </div>
          )}

          {/* SECTION 1: Service Request Description & Overview */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Request Details & Description
            </h4>
            <p className="mt-2 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {currentRequest.description || 'No detailed description provided.'}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-100 pt-3">
              <div>
                <span className="text-[11px] font-medium text-slate-400">Category</span>
                <p className="mt-0.5 text-xs font-semibold text-slate-800">
                  {currentRequest.category}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400">Priority Level</span>
                <p className="mt-0.5 text-xs font-semibold text-slate-800">
                  {priorityCfg.label}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400">Requested At</span>
                <p className="mt-0.5 text-xs font-semibold text-slate-800">
                  {formatDateTime(currentRequest.requestedAt)}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400">SLA Due Date</span>
                <p className="mt-0.5 text-xs font-semibold text-slate-800">
                  {currentRequest.slaDueAt ? formatDateTime(currentRequest.slaDueAt) : 'No SLA Target'}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: CUSTOMER DETAILS (FETCHED BY CUSTOMER ID) */}
          <div className="rounded-xl border border-teal-200/80 bg-teal-50/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BuildingIcon className="h-4 w-4 text-teal-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
                  Customer Information (ID #{currentRequest.customerId})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => fetchCustomerDetails(currentRequest.customerId)}
                className="text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
              >
                Reload Customer
              </button>
            </div>

            {/* Customer Loading State */}
            {loadingCustomer && (
              <div className="mt-3 flex items-center justify-center rounded-lg border border-dashed border-teal-200 bg-white/60 p-6 text-center">
                <svg
                  className="h-5 w-5 animate-spin text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="ml-2.5 text-xs font-medium text-slate-600">
                  Fetching customer details (ID #{currentRequest.customerId})...
                </span>
              </div>
            )}

            {/* Customer Error State */}
            {!loadingCustomer && customerError && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 flex items-center justify-between">
                <span>{customerError}</span>
                <button
                  type="button"
                  onClick={() => fetchCustomerDetails(currentRequest.customerId)}
                  className="font-semibold underline hover:text-rose-800 ml-2 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Customer Data Card */}
            {!loadingCustomer && customer && (
              <div className="mt-3 rounded-lg border border-teal-100 bg-white p-4 shadow-2xs">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 font-bold text-sm text-white">
                      {(customer.name?.[0] || 'C').toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-900">{customer.name}</h5>
                        {customer.status && (
                          <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 ring-1 ring-teal-600/20">
                            {customer.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">Customer ID: #{customer.id}</p>
                    </div>
                  </div>

                  {customer.externalReference && (
                    <div className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-mono text-slate-600 border border-slate-200/80">
                      External Ref: <strong>{customer.externalReference}</strong>
                    </div>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3 border-t border-slate-100 pt-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400">Email Address</span>
                    <p className="font-semibold text-slate-800 break-all">{customer.email || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Phone Number</span>
                    <p className="font-semibold text-slate-800 font-mono">{customer.phone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Customer Since</span>
                    <p className="font-semibold text-slate-800">{formatDate(customer.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: ADDRESS DETAILS (FETCHED BY ADDRESS ID / CUSTOMER ADDRESSES) */}
          <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  Service Location & Address Details{' '}
                  {currentRequest.addressId ? `(Address ID #${currentRequest.addressId})` : ''}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => fetchAddressDetails(currentRequest.customerId, currentRequest.addressId)}
                className="text-xs font-medium text-indigo-700 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                Reload Address
              </button>
            </div>

            {/* Address Loading State */}
            {loadingAddress && (
              <div className="mt-3 flex items-center justify-center rounded-lg border border-dashed border-indigo-200 bg-white/60 p-6 text-center">
                <svg
                  className="h-5 w-5 animate-spin text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="ml-2.5 text-xs font-medium text-slate-600">
                  Fetching location address details...
                </span>
              </div>
            )}

            {/* Address Error State */}
            {!loadingAddress && addressError && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 flex items-center justify-between">
                <span>{addressError}</span>
                <button
                  type="button"
                  onClick={() => fetchAddressDetails(currentRequest.customerId, currentRequest.addressId)}
                  className="font-semibold underline hover:text-rose-800 ml-2 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Address Empty State */}
            {!loadingAddress && !addressError && !address && (
              <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center">
                <p className="text-xs text-slate-500">
                  No specific address record linked for this service request.
                </p>
              </div>
            )}

            {/* Address Details Card */}
            {!loadingAddress && address && (
              <div className="mt-3 rounded-lg border border-indigo-100 bg-white p-4 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {address.addressLine1}
                      </span>
                      {address.isPrimary && (
                        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-600/20">
                          Primary Location
                        </span>
                      )}
                    </div>
                    {address.addressLine2 && (
                      <p className="text-xs text-slate-600">{address.addressLine2}</p>
                    )}
                    <p className="text-xs text-slate-600 font-medium">
                      {[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      {address.country}
                    </p>
                  </div>

                  <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    Address #{address.id}
                  </span>
                </div>

                {allAddresses.length > 1 && (
                  <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>
                      Total registered customer locations: <strong>{allAddresses.length}</strong>
                    </span>
                    <span className="text-indigo-600 font-medium">
                      {allAddresses.length} locations available
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 4: SOURCE & CREATED BY / WHO CREATED THIS */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Source & Creator Attribution
              </h4>
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${sourceCfg.bg}`}
              >
                Source: {sourceCfg.label}
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-slate-50/80 p-3.5 border border-slate-200/70">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <UsersIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {isEmployeeSource
                      ? `Created by Employee #${currentRequest.createdBy ?? 'N/A'}`
                      : `Created via ${currentRequest.source || 'Direct Client Request'}`}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Timestamp: {formatDateTime(currentRequest.createdAt)}
                  </p>
                </div>
              </div>

              {/* Action Button: Who created this request */}
              {isEmployeeSource && currentRequest.createdBy && (
                <button
                  type="button"
                  onClick={() => handleFetchCreatorEmployee(currentRequest.createdBy!)}
                  disabled={loadingCreator}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-xs hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer disabled:opacity-60"
                  title="Retrieve full employee profile who created this request"
                >
                  {loadingCreator ? (
                    <>
                      <svg
                        className="h-3.5 w-3.5 animate-spin text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Loading Employee...</span>
                    </>
                  ) : (
                    <>
                      <EyeIcon className="h-3.5 w-3.5 text-blue-600" />
                      <span>View Employee Details</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/75 px-6 py-4">
          <div className="text-xs text-slate-400 font-mono">
            Organization ID: #{currentRequest.organizationId}
          </div>
          <div className="flex items-center gap-2">
            {!isScheduled && onOpenScheduleModal && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<CalendarIcon className="h-3.5 w-3.5 text-sky-600" />}
                onClick={() => {
                  onClose()
                  onOpenScheduleModal(currentRequest.id)
                }}
              >
                Schedule Service
              </Button>
            )}
            {onEditRequest && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<PencilIcon className="h-3.5 w-3.5" />}
                onClick={() => {
                  onClose()
                  onEditRequest(currentRequest)
                }}
              >
                Edit Request
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* NESTED CREATOR EMPLOYEE PROFILE MODAL */}
      {isCreatorModalOpen && creatorEmployee && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsCreatorModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200">
            {/* Creator Header */}
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/75 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-base font-bold text-white shadow-sm ring-4 ring-white">
                  {(creatorEmployee.firstName?.[0] || 'U').toUpperCase()}
                  {(creatorEmployee.lastName?.[0] || '').toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold tracking-tight text-slate-900">
                      {creatorEmployee.firstName} {creatorEmployee.lastName}
                    </h3>
                    {creatorEmployee.role && (
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${
                          roleBadgeStyles[creatorEmployee.role]?.bg ||
                          'bg-slate-100 text-slate-700 ring-slate-500/20'
                        }`}
                      >
                        {roleBadgeStyles[creatorEmployee.role]?.label || creatorEmployee.role}
                      </span>
                    )}
                    {creatorEmployee.status && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${
                          employeeStatusStyles[creatorEmployee.status]?.bg ||
                          'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            employeeStatusStyles[creatorEmployee.status]?.dot || 'bg-emerald-600'
                          }`}
                        />
                        {creatorEmployee.status}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 font-mono">
                    Employee ID: #{creatorEmployee.employeeId ?? creatorEmployee.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatorModalOpen(false)}
                aria-label="Close creator profile"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Creator Profile Body */}
            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Employee Contact Information
                </h4>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className="text-[11px] font-medium text-slate-400">Email Address</span>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800 break-all">
                      {creatorEmployee.email}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className="text-[11px] font-medium text-slate-400">Phone Number</span>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800 font-mono">
                      {creatorEmployee.phone || '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Role & Account Details
                </h4>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className="text-[11px] font-medium text-slate-400">Job Role</span>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {roleBadgeStyles[creatorEmployee.role]?.label || creatorEmployee.role}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className="text-[11px] font-medium text-slate-400">Email Verified</span>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {creatorEmployee.emailVerifiedAt ? (
                        <span className="text-emerald-600 font-medium">
                          Verified ({formatDate(creatorEmployee.emailVerifiedAt)})
                        </span>
                      ) : (
                        <span className="text-amber-600">Pending Verification</span>
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className="text-[11px] font-medium text-slate-400">Member Since</span>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {formatDate(creatorEmployee.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className="text-[11px] font-medium text-slate-400">Last Login</span>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {formatDateTime(creatorEmployee.lastLoginAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Profile Footer */}
            <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/75 px-6 py-3.5">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreatorModalOpen(false)}
              >
                Back to Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceRequestDetailsModal
