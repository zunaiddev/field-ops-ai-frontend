import { type FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import {
  CloseIcon,
  PencilIcon,
  MapPinIcon,
  BuildingIcon,
} from '../icons'
import {
  ServiceRequestCategory,
  ServiceRequestPriority,
  type ServiceRequest,
  type UpdateServiceRequestDto,
} from '../../types/serviceRequest'
import type { CustomerAddressRes } from '../../types/customer'
import customerService from '../../services/customerService'
import serviceRequestService from '../../services/serviceRequestService'

interface UpdateServiceRequestModalProps {
  isOpen: boolean
  request: ServiceRequest | null
  onClose: () => void
  onRequestUpdated: (updatedRequest: ServiceRequest) => void
}

interface FormValues {
  title: string
  description: string
  category: ServiceRequestCategory
  priority: ServiceRequestPriority
  status: string
}

const CATEGORY_OPTIONS = [
  { value: ServiceRequestCategory.NETWORK, label: 'Network' },
  { value: ServiceRequestCategory.INSTALLATION, label: 'Installation' },
  { value: ServiceRequestCategory.REPAIR, label: 'Repair' },
  { value: ServiceRequestCategory.MAINTENANCE, label: 'Maintenance' },
  { value: ServiceRequestCategory.INSPECTION, label: 'Inspection' },
  { value: ServiceRequestCategory.OTHER, label: 'Other' },
]

const PRIORITY_OPTIONS = [
  { value: ServiceRequestPriority.LOW, label: 'Low' },
  { value: ServiceRequestPriority.MEDIUM, label: 'Medium' },
  { value: ServiceRequestPriority.HIGH, label: 'High' },
  { value: ServiceRequestPriority.CRITICAL, label: 'Critical' },
]

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REJECTED', label: 'Rejected' },
]

export const UpdateServiceRequestModal: FC<UpdateServiceRequestModalProps> = ({
  isOpen,
  request,
  onClose,
  onRequestUpdated,
}) => {
  // Address state
  const [addresses, setAddresses] = useState<CustomerAddressRes[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  // Fetch addresses and populate form whenever request changes
  useEffect(() => {
    if (isOpen && request) {
      reset({
        title: request.title || '',
        description: request.description || '',
        category: (request.category as ServiceRequestCategory) || ServiceRequestCategory.INSTALLATION,
        priority: (request.priority as ServiceRequestPriority) || ServiceRequestPriority.LOW,
        status: request.status || 'NEW',
      })

      setSelectedAddressId(request.addressId ? Number(request.addressId) : null)
      setAddressError(null)

      if (request.customerId) {
        setIsLoadingAddresses(true)
        customerService
          .getCustomerAddresses(request.customerId)
          .then((res) => {
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
              setAddresses(list)

              // If request.addressId matches one of the items, keep it, otherwise default to primary or first
              if (request.addressId) {
                setSelectedAddressId(Number(request.addressId))
              } else if (list.length > 0) {
                const primary = list.find((a) => a.isPrimary) || list[0]
                setSelectedAddressId(primary.id)
              }
            } else {
              setAddresses([])
              setAddressError(res.error?.message || 'No registered addresses found')
            }
          })
          .catch((err) => {
            setAddresses([])
            setAddressError(err instanceof Error ? err.message : 'Failed to fetch addresses')
          })
          .finally(() => {
            setIsLoadingAddresses(false)
          })
      }
    } else {
      setAddresses([])
      setSelectedAddressId(null)
      setAddressError(null)
    }
  }, [isOpen, request, reset])

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

  if (!isOpen || !request) return null

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: UpdateServiceRequestDto = {
        addressId: selectedAddressId ? Number(selectedAddressId) : null,
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        priority: values.priority,
        status: values.status,
      }

      const res = await serviceRequestService.updateServiceRequest(request.id, payload)
      if (res.success && res.payload) {
        toast.success('Service request updated successfully!')
        onRequestUpdated(res.payload)
        onClose()
      } else {
        toast.error(res.error?.message || 'Failed to update service request')
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An error occurred while updating service request',
      )
    }
  }

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
      <div className="relative z-10 w-full max-w-2xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/75 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm ring-4 ring-white">
              <PencilIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  #REQ-{request.id}
                </span>
                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                  Update Service Request
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Modify request details, category, priority, status, and service address.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-5 flex-1">
            {/* Customer Info Pill */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200/90 bg-slate-50/70 p-3 text-xs">
              <div className="flex items-center gap-2.5">
                <BuildingIcon className="h-4 w-4 text-slate-500" />
                <span className="font-semibold text-slate-800">
                  Customer ID #{request.customerId}
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                Source: {request.source}
              </span>
            </div>

            {/* Address Selection with full dynamic fetching */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-indigo-600" />
                  <label className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                    Service Address
                  </label>
                </div>
                {addresses.length > 0 && (
                  <span className="text-[11px] text-indigo-700 font-medium">
                    {addresses.length} address(es) available
                  </span>
                )}
              </div>

              {isLoadingAddresses && (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-indigo-200 bg-white p-4 text-center">
                  <svg
                    className="h-4 w-4 animate-spin text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="ml-2 text-xs text-slate-600">Fetching customer addresses...</span>
                </div>
              )}

              {!isLoadingAddresses && addressError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                  {addressError}
                </div>
              )}

              {!isLoadingAddresses && addresses.length > 0 && (
                <div className="space-y-2">
                  <select
                    value={selectedAddressId || ''}
                    onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ''} - {addr.city}, {addr.state} {addr.postalCode} ({addr.country})
                        {addr.isPrimary ? ' [PRIMARY]' : ''}
                      </option>
                    ))}
                  </select>

                  {/* Selected address preview card */}
                  {selectedAddressId && (
                    <div className="rounded-lg border border-indigo-100 bg-white p-3 text-xs shadow-2xs">
                      {(() => {
                        const active = addresses.find((a) => Number(a.id) === Number(selectedAddressId))
                        if (!active) return null
                        return (
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {active.addressLine1}
                                {active.addressLine2 ? `, ${active.addressLine2}` : ''}
                              </p>
                              <p className="text-slate-500 text-[11px] mt-0.5">
                                {[active.city, active.state, active.postalCode, active.country]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            </div>
                            <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              Address #{active.id}
                            </span>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Request Title & Description */}
            <div className="space-y-4">
              <Input
                label="Request Title"
                placeholder="e.g. Laptop is not working"
                required="Title is required"
                error={errors.title}
                name="title"
                register={register}
                rules={{ maxLength: { value: 150, message: 'Max 150 characters' } }}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. My laptop is not working"
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.description ? 'border-rose-400' : 'border-slate-300'
                  }`}
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Select
                  label="Category"
                  name="category"
                  register={register}
                  options={CATEGORY_OPTIONS}
                />

                <Select
                  label="Priority"
                  name="priority"
                  register={register}
                  options={PRIORITY_OPTIONS}
                />

                <Select
                  label="Status"
                  name="status"
                  register={register}
                  options={STATUS_OPTIONS}
                />
              </div>
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
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateServiceRequestModal
