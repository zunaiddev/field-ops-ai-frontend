import { type FC, useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Checkbox } from '../ui/Checkbox'
import { CloseIcon, PlusIcon, PencilIcon, TrashIcon, MapPinIcon, ClockIcon, UsersIcon, EyeIcon } from '../icons'
import type {
  Customer,
  CustomerAddressRes,
  CustomerHistoryRes,
  CustomerHistoryAction,
  CreateAddressDto,
  UpdateAddressDto,
  UpdateCustomerDto,
} from '../../types/customer'
import type { Employee } from '../../types/organization'
import { EMAIL_REGEX, PHONE_REGEX } from '../../constants/auth'
import customerService from '../../services/customerService'
import dashboardService from '../../services/dashboardService'

interface CustomerDetailsModalProps {
  isOpen: boolean
  customer: Customer | null
  initialTab?: 'addresses' | 'history'
  onClose: () => void
  onDeleteCustomer?: (customerId: number) => Promise<void> | void
  onCustomerUpdated?: (customer: Customer) => void
}

const statusBadgeStyles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  ACTIVE: {
    bg: 'bg-emerald-50 ring-emerald-600/20',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    label: 'Active',
  },
  PENDING: {
    bg: 'bg-amber-50 ring-amber-600/20',
    text: 'text-amber-700',
    dot: 'bg-amber-600',
    label: 'Pending',
  },
  INACTIVE: {
    bg: 'bg-slate-100 ring-slate-500/20',
    text: 'text-slate-600',
    dot: 'bg-slate-500',
    label: 'Inactive',
  },
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
  INVENTORY_MANAGER: { bg: 'bg-amber-50 text-amber-700 ring-amber-700/20', label: 'Inventory Manager', text: 'text-amber-700' },
  FINANCE: { bg: 'bg-teal-50 text-teal-700 ring-teal-700/20', label: 'Finance', text: 'text-teal-700' },
  VIEWER: { bg: 'bg-slate-100 text-slate-700 ring-slate-600/20', label: 'Viewer', text: 'text-slate-700' },
}

const actionBadgeStyles: Record<
  CustomerHistoryAction,
  { bg: string; text: string; label: string; dot: string }
> = {
  CREATED: {
    bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    label: 'Customer Created',
  },
  UPDATED: {
    bg: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    text: 'text-blue-700',
    dot: 'bg-blue-600',
    label: 'Customer Updated',
  },
  DELETED: {
    bg: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    text: 'text-rose-700',
    dot: 'bg-rose-600',
    label: 'Customer Deleted',
  },
  ADDRESS_CREATED: {
    bg: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    text: 'text-teal-700',
    dot: 'bg-teal-600',
    label: 'Address Added',
  },
  ADDRESS_UPDATED: {
    bg: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    text: 'text-amber-700',
    dot: 'bg-amber-600',
    label: 'Address Updated',
  },
  ADDRESS_DELETED: {
    bg: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    text: 'text-orange-700',
    dot: 'bg-orange-600',
    label: 'Address Removed',
  },
}

const CUSTOMER_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active Contract' },
  { value: 'PENDING', label: 'Pending Verification' },
  { value: 'INACTIVE', label: 'Inactive' },
]

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

export const CustomerDetailsModal: FC<CustomerDetailsModalProps> = ({
  isOpen,
  customer,
  initialTab = 'addresses',
  onClose,
  onDeleteCustomer,
  onCustomerUpdated,
}) => {
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(customer)
  const [activeTab, setActiveTab] = useState<'addresses' | 'history'>(initialTab)

  // Address state
  const [addresses, setAddresses] = useState<CustomerAddressRes[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)

  // History state
  const [history, setHistory] = useState<CustomerHistoryRes[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  // Employee details modal state
  const [selectedPerformer, setSelectedPerformer] = useState<Employee | null>(null)
  const [loadingPerformerId, setLoadingPerformerId] = useState<number | string | null>(null)

  // Edit Customer Info mode
  const [isEditingCustomer, setIsEditingCustomer] = useState(false)

  // Address create/edit form states
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)

  // Deletion confirmation states
  const [addressToDelete, setAddressToDelete] = useState<CustomerAddressRes | null>(null)
  const [isDeletingAddress, setIsDeletingAddress] = useState(false)
  const [showDeleteCustomerConfirm, setShowDeleteCustomerConfirm] = useState(false)
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false)

  // Customer form
  const {
    register: registerCustomer,
    handleSubmit: handleCustomerSubmit,
    reset: resetCustomerForm,
    formState: { errors: customerErrors, isSubmitting: isSubmittingCustomer },
  } = useForm<UpdateCustomerDto>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      externalReference: '',
      status: 'ACTIVE',
    },
  })

  // Address form
  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddressForm,
    setValue: setAddressValue,
    watch: watchAddress,
    formState: { errors: addressErrors, isSubmitting: isSubmittingAddress },
  } = useForm<CreateAddressDto>({
    defaultValues: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isPrimary: false,
    },
  })

  const isPrimaryChecked = watchAddress('isPrimary')

  // Fetch addresses
  const fetchAddresses = useCallback(async (customerId: number) => {
    setLoadingAddresses(true)
    setAddressError(null)
    try {
      const response = await customerService.getCustomerAddresses(customerId)
      if (response.success && response.payload) {
        if (Array.isArray(response.payload)) {
          setAddresses(response.payload)
        } else if (
          typeof response.payload === 'object' &&
          'data' in response.payload &&
          Array.isArray(response.payload.data)
        ) {
          setAddresses(response.payload.data)
        } else {
          setAddresses([])
        }
      } else {
        setAddressError(response.error?.message || 'Failed to load customer addresses')
      }
    } catch (err) {
      setAddressError(
        err instanceof Error ? err.message : 'An error occurred while fetching addresses',
      )
    } finally {
      setLoadingAddresses(false)
    }
  }, [])

  // Fetch audit history
  const fetchHistory = useCallback(async (customerId: number) => {
    setLoadingHistory(true)
    setHistoryError(null)
    try {
      const response = await customerService.getCustomerHistory(customerId)
      if (response.success && response.payload) {
        if (Array.isArray(response.payload)) {
          setHistory(response.payload)
        } else if (
          typeof response.payload === 'object' &&
          'data' in response.payload &&
          Array.isArray(response.payload.data)
        ) {
          setHistory(response.payload.data)
        } else {
          setHistory([])
        }
      } else {
        setHistoryError(response.error?.message || 'Failed to load customer audit history')
      }
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : 'An error occurred while fetching audit history',
      )
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  // Fetch Employee Details via API when user clicks button
  const handleFetchEmployeeDetails = async (employeeId: number | string) => {
    setLoadingPerformerId(employeeId)
    try {
      const response = await dashboardService.getMemberById(employeeId)
      if (response.success && response.payload) {
        setSelectedPerformer(response.payload)
      } else {
        toast.error(response.error?.message || `Failed to fetch employee details for ID #${employeeId}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while retrieving employee info')
    } finally {
      setLoadingPerformerId(null)
    }
  }

  useEffect(() => {
    if (isOpen && customer) {
      setCurrentCustomer(customer)
      setActiveTab(initialTab)
      fetchAddresses(customer.id)
      fetchHistory(customer.id)
      setIsAddressFormOpen(false)
      setIsEditingCustomer(false)
      setEditingAddressId(null)
      setAddressToDelete(null)
      setShowDeleteCustomerConfirm(false)
      setSelectedPerformer(null)
      resetCustomerForm({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        externalReference: customer.externalReference || '',
        status: customer.status || 'ACTIVE',
      })
    } else {
      setAddresses([])
      setHistory([])
      setAddressError(null)
      setHistoryError(null)
      setCurrentCustomer(null)
      setSelectedPerformer(null)
    }
  }, [isOpen, customer, initialTab, fetchAddresses, fetchHistory, resetCustomerForm])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPerformer) {
          setSelectedPerformer(null)
        } else if (showDeleteCustomerConfirm) {
          setShowDeleteCustomerConfirm(false)
        } else if (addressToDelete) {
          setAddressToDelete(null)
        } else if (isAddressFormOpen) {
          setIsAddressFormOpen(false)
        } else if (isEditingCustomer) {
          setIsEditingCustomer(false)
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
  }, [
    isOpen,
    selectedPerformer,
    showDeleteCustomerConfirm,
    addressToDelete,
    isAddressFormOpen,
    isEditingCustomer,
    onClose,
  ])

  if (!isOpen || !currentCustomer) return null

  const statusCfg = statusBadgeStyles[currentCustomer.status] ?? {
    bg: 'bg-slate-100 ring-slate-500/20',
    text: 'text-slate-600',
    dot: 'bg-slate-500',
    label: currentCustomer.status || 'Unknown',
  }
  const initial = (currentCustomer.name?.[0] || 'C').toUpperCase()

  // Handle Update Customer
  const onSaveCustomerDetails = async (data: UpdateCustomerDto) => {
    try {
      const payload: UpdateCustomerDto = {
        name: data.name?.trim(),
        email: data.email?.trim(),
        phone: data.phone?.trim() || undefined,
        externalReference: data.externalReference?.trim() || undefined,
        status: data.status,
      }

      const res = await customerService.updateCustomer(currentCustomer.id, payload)
      if (res.success && res.payload) {
        toast.success('Customer details updated successfully')
        setCurrentCustomer(res.payload)
        setIsEditingCustomer(false)
        onCustomerUpdated?.(res.payload)
        fetchHistory(currentCustomer.id)
      } else {
        toast.error(res.error?.message || 'Failed to update customer')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while updating customer')
    }
  }

  // Address Handlers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null)
    resetAddressForm({
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isPrimary: addresses.length === 0,
    })
    setIsAddressFormOpen(true)
  }

  const handleOpenEditAddress = (addr: CustomerAddressRes) => {
    setEditingAddressId(addr.id)
    setAddressValue('addressLine1', addr.addressLine1 || '')
    setAddressValue('addressLine2', addr.addressLine2 || '')
    setAddressValue('city', addr.city || '')
    setAddressValue('state', addr.state || '')
    setAddressValue('postalCode', addr.postalCode || '')
    setAddressValue('country', addr.country || '')
    setAddressValue('isPrimary', !!addr.isPrimary)
    setIsAddressFormOpen(true)
  }

  const handleSaveAddress = async (data: CreateAddressDto) => {
    try {
      if (editingAddressId !== null) {
        // Update existing address -> PATCH /customers/addresses/:addressId
        const updatePayload: UpdateAddressDto = {
          addressLine1: data.addressLine1.trim(),
          addressLine2: data.addressLine2?.trim() || undefined,
          city: data.city.trim(),
          state: data.state.trim(),
          postalCode: data.postalCode.trim(),
          country: data.country.trim(),
          isPrimary: !!data.isPrimary,
        }
        const res = await customerService.updateCustomerAddress(editingAddressId, updatePayload)
        if (res.success && res.payload) {
          toast.success('Address updated successfully')
          setAddresses((prev) =>
            prev.map((a) =>
              a.id === editingAddressId
                ? { ...a, ...res.payload }
                : updatePayload.isPrimary
                  ? { ...a, isPrimary: false }
                  : a,
            ),
          )
          setIsAddressFormOpen(false)
          setEditingAddressId(null)
          resetAddressForm()
          fetchHistory(currentCustomer.id)
        } else {
          toast.error(res.error?.message || 'Failed to update address')
        }
      } else {
        // Add new address -> POST /customers/:customerId/addresses
        const createPayload: CreateAddressDto = {
          addressLine1: data.addressLine1.trim(),
          addressLine2: data.addressLine2?.trim() || undefined,
          city: data.city.trim(),
          state: data.state.trim(),
          postalCode: data.postalCode.trim(),
          country: data.country.trim(),
          isPrimary: !!data.isPrimary,
        }
        const res = await customerService.addCustomerAddress(currentCustomer.id, createPayload)
        if (res.success && res.payload) {
          toast.success('Address added successfully')
          setAddresses((prev) => {
            const updated = createPayload.isPrimary
              ? prev.map((a) => ({ ...a, isPrimary: false }))
              : [...prev]
            return [...updated, res.payload!]
          })
          setIsAddressFormOpen(false)
          resetAddressForm()
          fetchHistory(currentCustomer.id)
        } else {
          toast.error(res.error?.message || 'Failed to add address')
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while saving address')
    }
  }

  const handleDeleteAddress = async () => {
    if (!addressToDelete || !addressToDelete.id) return
    setIsDeletingAddress(true)
    try {
      // DELETE /customers/addresses/:addressId
      const res = await customerService.deleteCustomerAddress(addressToDelete.id)
      if (res.success) {
        toast.success('Address deleted successfully')
        setAddresses((prev) => prev.filter((a) => a.id !== addressToDelete.id))
        setAddressToDelete(null)
        fetchHistory(currentCustomer.id)
      } else {
        toast.error(res.error?.message || 'Failed to delete address')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while deleting address')
    } finally {
      setIsDeletingAddress(false)
    }
  }

  const handleDeleteCustomer = async () => {
    setIsDeletingCustomer(true)
    try {
      // DELETE /customers/:id
      const res = await customerService.deleteCustomer(currentCustomer.id)
      if (res.success) {
        toast.success(`Customer "${currentCustomer.name}" deleted successfully`)
        if (onDeleteCustomer) {
          await onDeleteCustomer(currentCustomer.id)
        }
        onClose()
      } else {
        toast.error(res.error?.message || 'Failed to delete customer')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while deleting customer')
    } finally {
      setIsDeletingCustomer(false)
      setShowDeleteCustomerConfirm(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-lg font-bold text-white shadow-sm ring-4 ring-white">
              {initial}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  {currentCustomer.name}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusCfg.bg} ${statusCfg.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
                {currentCustomer.externalReference && (
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700">
                    Ref: {currentCustomer.externalReference}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Customer ID: #{currentCustomer.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingCustomer((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <PencilIcon className="h-3.5 w-3.5" />
              {isEditingCustomer ? 'Cancel Edit' : 'Edit Customer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Delete Customer Confirmation Alert */}
        {showDeleteCustomerConfirm && (
          <div className="border-b border-rose-200 bg-rose-50 p-4 transition-all animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <TrashIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-semibold text-rose-900">
                  Are you sure you want to delete this customer account?
                </p>
                <p className="mt-0.5 text-rose-700">
                  This will permanently delete <strong>{currentCustomer.name}</strong>, along with all associated addresses and records.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteCustomer}
                    disabled={isDeletingCustomer}
                    className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isDeletingCustomer ? 'Deleting...' : 'Yes, Delete Customer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteCustomerConfirm(false)}
                    disabled={isDeletingCustomer}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Address Confirmation Alert */}
        {addressToDelete && (
          <div className="border-b border-amber-200 bg-amber-50 p-4 transition-all animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <TrashIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-semibold text-amber-900">
                  Delete address &quot;{addressToDelete.addressLine1}&quot;?
                </p>
                <p className="mt-0.5 text-amber-700">
                  Are you sure you want to remove this location from {currentCustomer.name}&apos;s account?
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAddress}
                    disabled={isDeletingAddress}
                    className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isDeletingAddress ? 'Deleting...' : 'Yes, Remove Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressToDelete(null)}
                    disabled={isDeletingAddress}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Customer Edit Form or Info Cards */}
          {isEditingCustomer ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 animate-in fade-in duration-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3">
                Edit Customer Account Details
              </h4>
              <form onSubmit={handleCustomerSubmit(onSaveCustomerDetails)} className="space-y-3" noValidate>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="Customer Name"
                    placeholder="e.g. Horizon Logistics Center"
                    required="Customer name is required"
                    error={customerErrors.name}
                    name="name"
                    register={registerCustomer}
                    rules={{ maxLength: { value: 150, message: 'Max 150 chars' } }}
                  />

                  <Input
                    label="Contact Email"
                    type="email"
                    placeholder="contact@client.com"
                    error={customerErrors.email}
                    name="email"
                    register={registerCustomer}
                    rules={{
                      pattern: { value: EMAIL_REGEX, message: 'Valid email required' },
                      maxLength: { value: 255, message: 'Max 255 chars' },
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+1234567890"
                    error={customerErrors.phone}
                    name="phone"
                    register={registerCustomer}
                    rules={{
                      validate: (v) => {
                        if (!v) return true
                        return PHONE_REGEX.test(v) || 'Invalid phone format'
                      },
                    }}
                  />

                  <Input
                    label="External Reference"
                    placeholder="e.g. EXT-1001"
                    error={customerErrors.externalReference}
                    name="externalReference"
                    register={registerCustomer}
                  />

                  <Select
                    label="Status"
                    error={customerErrors.status}
                    name="status"
                    register={registerCustomer}
                    options={CUSTOMER_STATUS_OPTIONS}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingCustomer(false)}
                    disabled={isSubmittingCustomer}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSubmittingCustomer}
                  >
                    Update Customer
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer Information
              </h4>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                  <span className="text-[11px] font-medium text-slate-400">Email Address</span>
                  <p className="mt-1 text-xs font-semibold text-slate-800 break-all">
                    {currentCustomer.email}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                  <span className="text-[11px] font-medium text-slate-400">Phone Number</span>
                  <p className="mt-1 text-xs font-semibold text-slate-800 font-mono">
                    {currentCustomer.phone || '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                  <span className="text-[11px] font-medium text-slate-400">External Ref</span>
                  <p className="mt-1 text-xs font-semibold text-slate-800 font-mono">
                    {currentCustomer.externalReference || '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                  <span className="text-[11px] font-medium text-slate-400">Member Since</span>
                  <p className="mt-1 text-xs font-semibold text-slate-800">
                    {formatDate(currentCustomer.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs (Addresses vs Audit History) */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-4">
              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className={`inline-flex items-center gap-2 border-b-2 py-2.5 px-1 text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <MapPinIcon className="h-4 w-4" />
                <span>Addresses</span>
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === 'addresses'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {addresses.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`inline-flex items-center gap-2 border-b-2 py-2.5 px-1 text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'history'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <ClockIcon className="h-4 w-4" />
                <span>Audit History</span>
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === 'history'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {history.length}
                </span>
              </button>
            </nav>
          </div>

          {/* TAB 1: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Registered Locations
                  </h4>
                </div>

                {!isAddressFormOpen && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<PlusIcon className="h-3.5 w-3.5" />}
                    onClick={handleOpenAddAddress}
                  >
                    Add Address
                  </Button>
                )}
              </div>

              {/* Address Form (Add / Edit) */}
              {isAddressFormOpen && (
                <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/40 p-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-teal-100 mb-3">
                    <h5 className="text-xs font-bold text-teal-900">
                      {editingAddressId !== null ? 'Update Address' : 'Add New Customer Address'}
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddressFormOpen(false)
                        setEditingAddressId(null)
                        resetAddressForm()
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleAddressSubmit(handleSaveAddress)} className="space-y-3" noValidate>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="Address Line 1"
                        placeholder="e.g. 123 Main St"
                        required="Address Line 1 is required"
                        error={addressErrors.addressLine1}
                        name="addressLine1"
                        register={registerAddress}
                        rules={{ maxLength: { value: 100, message: 'Max 100 chars' } }}
                      />

                      <Input
                        label="Address Line 2 (optional)"
                        placeholder="e.g. Suite 400, Floor 2"
                        error={addressErrors.addressLine2}
                        name="addressLine2"
                        register={registerAddress}
                        rules={{ maxLength: { value: 100, message: 'Max 100 chars' } }}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                      <Input
                        label="City"
                        placeholder="e.g. Springfield"
                        required="City is required"
                        error={addressErrors.city}
                        name="city"
                        register={registerAddress}
                        rules={{ maxLength: { value: 100, message: 'Max 100 chars' } }}
                      />

                      <Input
                        label="State / Province"
                        placeholder="e.g. IL"
                        required="State is required"
                        error={addressErrors.state}
                        name="state"
                        register={registerAddress}
                        rules={{ maxLength: { value: 100, message: 'Max 100 chars' } }}
                      />

                      <Input
                        label="Postal / ZIP Code"
                        placeholder="e.g. 62701"
                        required="Postal code is required"
                        error={addressErrors.postalCode}
                        name="postalCode"
                        register={registerAddress}
                        rules={{ maxLength: { value: 20, message: 'Max 20 chars' } }}
                      />

                      <Input
                        label="Country"
                        placeholder="e.g. USA"
                        required="Country is required"
                        error={addressErrors.country}
                        name="country"
                        register={registerAddress}
                        rules={{ maxLength: { value: 100, message: 'Max 100 chars' } }}
                      />
                    </div>

                    <div className="pt-1">
                      <Checkbox
                        label="Set as Primary Address"
                        name="isPrimary"
                        register={registerAddress}
                        checked={isPrimaryChecked}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-teal-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddressFormOpen(false)
                          setEditingAddressId(null)
                          resetAddressForm()
                        }}
                        disabled={isSubmittingAddress}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={isSubmittingAddress}
                      >
                        {editingAddressId !== null ? 'Save Changes' : 'Create Address'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Loading Addresses State */}
              {loadingAddresses && (
                <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                  <svg
                    className="h-6 w-6 animate-spin text-teal-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="ml-3 text-xs font-medium text-slate-600">
                    Retrieving customer addresses...
                  </span>
                </div>
              )}

              {/* Address Fetch Error */}
              {!loadingAddresses && addressError && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-xs text-rose-700 flex items-center justify-between">
                  <span>{addressError}</span>
                  <button
                    type="button"
                    onClick={() => fetchAddresses(currentCustomer.id)}
                    className="font-semibold underline hover:text-rose-800 cursor-pointer ml-2"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty Addresses State */}
              {!loadingAddresses && !addressError && addresses.length === 0 && !isAddressFormOpen && (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                  <MapPinIcon className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-xs font-semibold text-slate-800">No addresses registered</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Add billing, site, or warehouse locations for this customer.
                  </p>
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<PlusIcon className="h-3.5 w-3.5" />}
                      onClick={handleOpenAddAddress}
                    >
                      Add First Address
                    </Button>
                  </div>
                </div>
              )}

              {/* Address Cards List */}
              {!loadingAddresses && addresses.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {addresses.map((addr, idx) => (
                    <div
                      key={addr.id ?? idx}
                      className="relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-[10px] font-bold text-teal-700 ring-1 ring-teal-600/20">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {addr.city}, {addr.state}
                            </span>
                            {addr.isPrimary && (
                              <span className="inline-flex items-center rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700 ring-1 ring-teal-600/20">
                                Primary
                              </span>
                            )}
                          </div>
                          {addr.id && (
                            <span className="font-mono text-[10px] text-slate-400">
                              #{addr.id}
                            </span>
                          )}
                        </div>

                        <div className="mt-2.5 space-y-0.5 text-xs text-slate-600">
                          <p className="font-medium text-slate-900">{addr.addressLine1}</p>
                          {addr.addressLine2 && (
                            <p className="text-slate-500 text-[11px]">{addr.addressLine2}</p>
                          )}
                          <p className="text-slate-500 text-[11px]">
                            {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}
                          </p>
                          <p className="text-slate-400 text-[11px] font-medium">{addr.country}</p>
                        </div>
                      </div>

                      {/* Actions: Edit & Delete Address */}
                      <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-2.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAddress(addr)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <PencilIcon className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddressToDelete(addr)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                        >
                          <TrashIcon className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AUDIT HISTORY */}
          {activeTab === 'history' && (
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Customer Audit & Change Log
                </h4>
                <button
                  type="button"
                  onClick={() => fetchHistory(currentCustomer.id)}
                  className="text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                >
                  Refresh History
                </button>
              </div>

              {/* Loading History State */}
              {loadingHistory && (
                <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                  <svg
                    className="h-6 w-6 animate-spin text-teal-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="ml-3 text-xs font-medium text-slate-600">
                    Retrieving customer audit trail...
                  </span>
                </div>
              )}

              {/* History Fetch Error */}
              {!loadingHistory && historyError && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-xs text-rose-700 flex items-center justify-between">
                  <span>{historyError}</span>
                  <button
                    type="button"
                    onClick={() => fetchHistory(currentCustomer.id)}
                    className="font-semibold underline hover:text-rose-800 cursor-pointer ml-2"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty History State */}
              {!loadingHistory && !historyError && history.length === 0 && (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                  <ClockIcon className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-xs font-semibold text-slate-800">No activity history found</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Changes to this customer and associated addresses will be logged here.
                  </p>
                </div>
              )}

              {/* Timeline History List */}
              {!loadingHistory && history.length > 0 && (
                <div className="mt-4 flow-root">
                  <ul className="-mb-8">
                    {history.map((event, eventIdx) => {
                      const badgeCfg = actionBadgeStyles[event.action] ?? {
                        bg: 'bg-slate-100 text-slate-700 ring-slate-500/20',
                        text: 'text-slate-700',
                        dot: 'bg-slate-500',
                        label: event.action,
                      }

                      const isPerformerLoading =
                        loadingPerformerId !== null &&
                        String(loadingPerformerId) === String(event.createdBy)

                      return (
                        <li key={event.id ?? eventIdx}>
                          <div className="relative pb-8">
                            {eventIdx !== history.length - 1 ? (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3 items-start">
                              <div>
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${badgeCfg.bg}`}>
                                  <span className={`h-2 w-2 rounded-full ${badgeCfg.dot}`} />
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${badgeCfg.bg}`}>
                                      {badgeCfg.label}
                                    </span>
                                  </div>
                                  <div className="whitespace-nowrap text-[11px] font-mono text-slate-400">
                                    {formatDateTime(event.createdAt)}
                                  </div>
                                </div>

                                {event.description && (
                                  <p className="mt-1 text-xs text-slate-800 font-medium">
                                    {event.description}
                                  </p>
                                )}

                                {/* Performed By Action Button & Details */}
                                <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 border border-slate-200/80">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                                      <UsersIcon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-xs font-semibold text-slate-700">
                                        {event.createdBy
                                          ? `Performed by Employee #${event.createdBy}`
                                          : 'Performed by System / Automated Event'}
                                      </span>
                                    </div>
                                  </div>

                                  {event.createdBy && (
                                    <button
                                      type="button"
                                      onClick={() => handleFetchEmployeeDetails(event.createdBy!)}
                                      disabled={isPerformerLoading}
                                      className="inline-flex items-center gap-1.5 shrink-0 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-teal-700 shadow-2xs hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 transition-colors cursor-pointer disabled:opacity-60"
                                      title="Call API to retrieve full employee profile details"
                                    >
                                      {isPerformerLoading ? (
                                        <>
                                          <svg className="h-3 w-3 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                          </svg>
                                          <span>Loading...</span>
                                        </>
                                      ) : (
                                        <>
                                          <EyeIcon className="h-3.5 w-3.5" />
                                          <span>View Employee Details</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {!showDeleteCustomerConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteCustomerConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <TrashIcon className="h-4 w-4" />
                Delete Customer Account
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* NESTED FULL EMPLOYEE DETAILS MODAL */}
      {selectedPerformer && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setSelectedPerformer(null)}
          />

          <div className="relative z-10 w-full max-w-xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/60 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-sm ring-4 ring-white">
                  {(selectedPerformer.firstName?.[0] || 'U').toUpperCase()}
                  {(selectedPerformer.lastName?.[0] || '').toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight text-slate-900">
                      {selectedPerformer.firstName} {selectedPerformer.lastName}
                    </h3>
                    {selectedPerformer.role && (
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ring-1 ${
                          roleBadgeStyles[selectedPerformer.role]?.bg ||
                          'bg-slate-100 text-slate-700 ring-slate-500/20'
                        }`}
                      >
                        {roleBadgeStyles[selectedPerformer.role]?.label || selectedPerformer.role}
                      </span>
                    )}
                    {selectedPerformer.status && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                          statusBadgeStyles[selectedPerformer.status]?.bg ||
                          'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            statusBadgeStyles[selectedPerformer.status]?.dot || 'bg-emerald-600'
                          }`}
                        />
                        {selectedPerformer.status}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 font-mono">
                    Employee ID: #{selectedPerformer.employeeId ?? selectedPerformer.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPerformer(null)}
                aria-label="Close performer details"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Details */}
            <div className="max-h-[65vh] overflow-y-auto p-6 space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Personal & Contact Information
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                    <span className="text-[11px] font-medium text-slate-400">First Name</span>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedPerformer.firstName || '—'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                    <span className="text-[11px] font-medium text-slate-400">Last Name</span>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedPerformer.lastName || '—'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                    <span className="text-[11px] font-medium text-slate-400">Email Address</span>
                    <p className="mt-1 text-sm font-semibold text-slate-800 break-all">
                      {selectedPerformer.email}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                    <span className="text-[11px] font-medium text-slate-400">Phone Number</span>
                    <p className="mt-1 text-sm font-semibold text-slate-800 font-mono">
                      {selectedPerformer.phone || '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Role & Account Status
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                    <span className="text-[11px] font-medium text-slate-400">Assigned Role</span>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {roleBadgeStyles[selectedPerformer.role]?.label || selectedPerformer.role || 'Member'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                    <span className="text-[11px] font-medium text-slate-400">Email Verification</span>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedPerformer.emailVerifiedAt ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Verified ({formatDate(selectedPerformer.emailVerifiedAt)})
                        </span>
                      ) : (
                        <span className="text-amber-600">Pending Verification</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Activity & System Records
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                    <span className="text-[11px] font-medium text-slate-400">Employee ID</span>
                    <p className="mt-1 text-xs font-semibold text-slate-700 font-mono">
                      #{selectedPerformer.employeeId ?? selectedPerformer.id}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                    <span className="text-[11px] font-medium text-slate-400">Last Login</span>
                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {formatDateTime(selectedPerformer.lastLoginAt)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                    <span className="text-[11px] font-medium text-slate-400">Member Since</span>
                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {formatDate(selectedPerformer.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 sm:col-span-3">
                    <span className="text-[11px] font-medium text-slate-400">Last Updated</span>
                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {formatDate(selectedPerformer.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <Button variant="primary" size="sm" onClick={() => setSelectedPerformer(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerDetailsModal
