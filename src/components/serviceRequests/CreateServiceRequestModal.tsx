import { type FC, useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import {
  CloseIcon,
  TicketIcon,
  SearchIcon,
  BuildingIcon,
  MapPinIcon,
} from '../icons'
import {
  ServiceRequestCategory,
  ServiceRequestPriority,
  type CreateServiceRequestDto,
  type ServiceRequest,
} from '../../types/serviceRequest'
import type { Customer, CustomerAddressRes } from '../../types/customer'
import customerService from '../../services/customerService'
import serviceRequestService from '../../services/serviceRequestService'

interface CreateServiceRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onRequestCreated: (newRequest: ServiceRequest) => void
}

interface FormValues {
  title: string
  description: string
  category: ServiceRequestCategory
  priority: ServiceRequestPriority
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

export const CreateServiceRequestModal: FC<CreateServiceRequestModalProps> = ({
  isOpen,
  onClose,
  onRequestCreated,
}) => {
  // Customer Search State
  const [searchName, setSearchName] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false)
  const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Address Selection State
  const [addresses, setAddresses] = useState<CustomerAddressRes[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      category: ServiceRequestCategory.REPAIR,
      priority: ServiceRequestPriority.CRITICAL,
    },
  })

  // Reset form and state on open/close
  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        description: '',
        category: ServiceRequestCategory.REPAIR,
        priority: ServiceRequestPriority.CRITICAL,
      })
      setSearchName('')
      setSearchEmail('')
      setCustomerSearchResults([])
      setHasSearched(false)
      setSelectedCustomer(null)
      setAddresses([])
      setSelectedAddressId(null)
      setAddressError(null)
    }
  }, [isOpen, reset])

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

  // Search Customers by Name and/or Email
  const handleSearchCustomers = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchName.trim() && !searchEmail.trim()) {
      toast.error('Please enter customer name or email to search')
      return
    }

    setIsSearchingCustomers(true)
    setHasSearched(true)
    try {
      const res = await customerService.getCustomers({
        name: searchName.trim() || undefined,
        email: searchEmail.trim() || undefined,
        page: 1,
        pageSize: 15,
      })

      if (res.success && res.payload) {
        let list: Customer[] = []
        if (Array.isArray(res.payload)) {
          list = res.payload
        } else if (res.payload.data && Array.isArray(res.payload.data)) {
          list = res.payload.data
        }
        setCustomerSearchResults(list)
      } else {
        setCustomerSearchResults([])
        toast.error(res.error?.message || 'No customers found')
      }
    } catch (err) {
      setCustomerSearchResults([])
      toast.error(err instanceof Error ? err.message : 'Error searching customers')
    } finally {
      setIsSearchingCustomers(false)
    }
  }, [searchName, searchEmail])

  // Fetch Addresses for Selected Customer
  const handleSelectCustomer = async (cust: Customer) => {
    setSelectedCustomer(cust)
    setSelectedAddressId(null)
    setAddressError(null)
    setIsLoadingAddresses(true)

    try {
      const res = await customerService.getCustomerAddresses(cust.id)
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

        // Preselect primary address if available
        if (list.length > 0) {
          const primary = list.find((a) => a.isPrimary) || list[0]
          setSelectedAddressId(primary.id)
        } else {
          setAddressError('This customer has no registered addresses. Please add an address for this customer.')
        }
      } else {
        setAddresses([])
        setAddressError(res.error?.message || 'Failed to retrieve addresses for this customer')
      }
    } catch (err) {
      setAddresses([])
      setAddressError(err instanceof Error ? err.message : 'Error fetching customer addresses')
    } finally {
      setIsLoadingAddresses(false)
    }
  }

  const handleClearSelectedCustomer = () => {
    setSelectedCustomer(null)
    setSelectedAddressId(null)
    setAddresses([])
    setAddressError(null)
  }

  // Submit Request Creation
  const onSubmit = async (values: FormValues) => {
    if (!selectedCustomer) {
      toast.error('Please search and select a customer')
      return
    }

    if (!selectedAddressId) {
      toast.error('Please select an address for this service request')
      return
    }

    try {
      const payload: CreateServiceRequestDto = {
        customerId: selectedCustomer.id,
        addressId: selectedAddressId,
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        priority: values.priority,
      }

      const res = await serviceRequestService.createServiceRequest(payload)
      if (res.success && res.payload) {
        toast.success('Service request created successfully!')
        onRequestCreated(res.payload)
        onClose()
      } else {
        toast.error(res.error?.message || 'Failed to create service request')
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An error occurred while creating service request',
      )
    }
  }

  if (!isOpen) return null

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
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm ring-4 ring-white">
              <TicketIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Create Service Request
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Search customer, select address, and configure service dispatch details.
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
          <div className="overflow-y-auto p-6 space-y-5 flex-1">
            {/* STEP 1: CUSTOMER SEARCH & SELECTION */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BuildingIcon className="h-4 w-4 text-slate-600" />
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Step 1: Select Customer <span className="text-rose-500">*</span>
                  </label>
                </div>
                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={handleClearSelectedCustomer}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Change Customer
                  </button>
                )}
              </div>

              {!selectedCustomer ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label="Customer Name"
                      placeholder="e.g. Acme Corp or John"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSearchCustomers()
                        }
                      }}
                    />
                    <Input
                      label="Customer Email"
                      placeholder="e.g. contact@acme.com"
                      type="email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSearchCustomers()
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<SearchIcon className="h-3.5 w-3.5" />}
                      onClick={() => handleSearchCustomers()}
                      isLoading={isSearchingCustomers}
                    >
                      Search Customer
                    </Button>
                  </div>

                  {/* Customer Results List */}
                  {hasSearched && (
                    <div className="mt-2 space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {customerSearchResults.length > 0
                          ? `Found ${customerSearchResults.length} customer(s)`
                          : 'No matching customers found'}
                      </p>

                      {customerSearchResults.length > 0 && (
                        <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-lg border border-slate-200 bg-white p-2">
                          {customerSearchResults.map((cust) => (
                            <div
                              key={cust.id}
                              onClick={() => handleSelectCustomer(cust)}
                              className="flex items-center justify-between rounded-lg p-2.5 hover:bg-blue-50/70 border border-transparent hover:border-blue-200 cursor-pointer transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900 truncate">
                                    {cust.name}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                    #{cust.id}
                                  </span>
                                </div>
                                <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-500">
                                  <span>{cust.email || 'No email'}</span>
                                  {cust.phone && <span>• {cust.phone}</span>}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="shrink-0 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                              >
                                Select
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Selected Customer Summary Card */
                <div className="flex items-center justify-between rounded-lg border border-teal-200 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 font-bold text-sm text-white">
                      {(selectedCustomer.name?.[0] || 'C').toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {selectedCustomer.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Customer ID #{selectedCustomer.id}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {selectedCustomer.email} {selectedCustomer.phone ? `• ${selectedCustomer.phone}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: ADDRESS SELECTION */}
            {selectedCustomer && (
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-slate-600" />
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Step 2: Select Service Address <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  {addresses.length > 0 && (
                    <span className="text-[11px] text-slate-400">
                      {addresses.length} address(es) available
                    </span>
                  )}
                </div>

                {isLoadingAddresses && (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center">
                    <svg
                      className="h-5 w-5 animate-spin text-blue-600"
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
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                    {addressError}
                  </div>
                )}

                {!isLoadingAddresses && addresses.length > 0 && (
                  <div className="space-y-2">
                    <select
                      value={selectedAddressId || ''}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ''} - {addr.city}, {addr.state} {addr.postalCode} ({addr.country})
                          {addr.isPrimary ? ' [PRIMARY]' : ''}
                        </option>
                      ))}
                    </select>

                    {/* Active selected address preview card */}
                    {selectedAddressId && (
                      <div className="rounded-lg border border-indigo-100 bg-white p-3 text-xs">
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
                              <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
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
            )}

            {/* STEP 3: REQUEST DETAILS */}
            <div className="space-y-4 pt-1">
              <Input
                label="Request Title"
                placeholder="e.g. Fix Network Connectivity Issues"
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
                  placeholder="e.g. Intermittent loss of connection reported during peak hours."
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.description ? 'border-rose-400' : 'border-slate-300'
                  }`}
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              disabled={!selectedCustomer || !selectedAddressId}
            >
              Create Service Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateServiceRequestModal
