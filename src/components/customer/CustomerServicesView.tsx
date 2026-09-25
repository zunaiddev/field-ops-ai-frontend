import { useCallback, useEffect, useMemo, useState, type FC } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import {
  CloseIcon,
  EyeIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TicketIcon,
  TrashIcon,
} from '../icons'
import customerPortalService from '../../services/customerPortalService'
import { useAlertModal } from '../../context/AlertModalContext'
import type {
  CreateCustomerServiceRequestDto,
  CustomerAddress,
  CustomerServiceCategory,
  CustomerServicePriority,
  CustomerServiceRequest,
  CustomerServiceStatus,
  UpdateCustomerServiceRequestDto,
} from '../../types/publicCustomer'
import { Link } from 'react-router-dom'

const CATEGORY_OPTIONS: { value: CustomerServiceCategory; label: string }[] = [
  { value: 'NETWORK', label: 'Network' },
  { value: 'INSTALLATION', label: 'Installation' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'OTHER', label: 'Other' },
]

const PRIORITY_OPTIONS: { value: CustomerServicePriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
]

const STATUS_BADGES: Record<string, { bg: string; text: string; ring: string }> = {
  NEW: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-700/20' },
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-700/20' },
  IN_PROGRESS: { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-700/20' },
  ON_HOLD: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-700/20' },
  RESOLVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-700/20' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-700/20' },
  CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-700/20' },
}

const PRIORITY_BADGES: Record<string, { bg: string; text: string; ring: string }> = {
  LOW: { bg: 'bg-slate-50', text: 'text-slate-700', ring: 'ring-slate-700/20' },
  MEDIUM: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-700/20' },
  HIGH: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-700/20' },
  CRITICAL: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-700/20' },
}

export const CustomerServicesView: FC = () => {
  const { alert, confirm } = useAlertModal()
  const [requests, setRequests] = useState<CustomerServiceRequest[]>([])
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<CustomerServiceRequest | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<CustomerServiceRequest | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Create/Edit Form State
  const [formAddressId, setFormAddressId] = useState<number | ''>('')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formCategory, setFormCategory] = useState<CustomerServiceCategory>('REPAIR')
  const [formPriority, setFormPriority] = useState<CustomerServicePriority>('MEDIUM')
  const [formStatus, setFormStatus] = useState<CustomerServiceStatus>('NEW')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [reqRes, addrRes] = await Promise.all([
        customerPortalService.getServiceRequests(),
        customerPortalService.getAddresses(),
      ])

      if (reqRes.success && reqRes.payload) {
        setRequests(Array.isArray(reqRes.payload) ? reqRes.payload : [])
      } else {
        setError(reqRes.error?.message || 'Failed to load service requests')
      }

      if (addrRes.success && addrRes.payload) {
        setAddresses(Array.isArray(addrRes.payload) ? addrRes.payload : [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Address lookup helper
  const addressMap = useMemo(() => {
    const map = new Map<number, CustomerAddress>()
    addresses.forEach((a) => map.set(a.id, a))
    return map
  }, [addresses])

  // Filtering
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        req.title?.toLowerCase().includes(q) ||
        req.description?.toLowerCase().includes(q) ||
        String(req.id).includes(q)

      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
      const matchesPriority = priorityFilter === 'ALL' || req.priority === priorityFilter
      const matchesCategory = categoryFilter === 'ALL' || req.category === categoryFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })
  }, [requests, searchQuery, statusFilter, priorityFilter, categoryFilter])

  // Form Handlers
  const resetForm = () => {
    const primaryAddr = addresses.find((a) => a.isPrimary) || addresses[0]
    setFormAddressId(primaryAddr ? primaryAddr.id : '')
    setFormTitle('')
    setFormDescription('')
    setFormCategory('REPAIR')
    setFormPriority('MEDIUM')
    setFormStatus('NEW')
    setFormErrors({})
  }

  const handleOpenCreateModal = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  const handleOpenEditModal = (req: CustomerServiceRequest) => {
    if (req.status !== 'NEW') {
      alert({
        title: 'Editing Not Allowed',
        message: `This service request is currently in "${req.status}" status and cannot be edited. Only requests with status "NEW" can be updated.`,
        variant: 'warning',
      })
      return
    }
    setEditingRequest(req)
    setFormAddressId(req.addressId)
    setFormTitle(req.title)
    setFormDescription(req.description || '')
    setFormCategory(req.category)
    setFormPriority(req.priority)
    setFormStatus(req.status)
    setFormErrors({})
    setIsEditModalOpen(true)
  }

  const handleOpenViewModal = (req: CustomerServiceRequest) => {
    setSelectedRequest(req)
    setIsViewModalOpen(true)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formAddressId) {
      errors.addressId = 'Please select a service address'
    }
    if (!formTitle.trim()) {
      errors.title = 'Title is required'
    } else if (formTitle.trim().length > 200) {
      errors.title = 'Title cannot exceed 200 characters'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    const payload: CreateCustomerServiceRequestDto = {
      customerId: 1, // Dummy customerId as requested (ignored by backend)
      addressId: Number(formAddressId),
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      category: formCategory,
      priority: formPriority,
    }

    const res = await customerPortalService.createServiceRequest(payload)
    if (res.success && res.payload) {
      toast.success('Service request submitted successfully!')
      setIsCreateModalOpen(false)
      resetForm()
      fetchData()
    } else {
      toast.error(res.error?.message || 'Failed to submit service request')
    }
    setIsSubmitting(false)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRequest || !validateForm()) return

    if (editingRequest.status !== 'NEW') {
      alert({
        title: 'Update Not Allowed',
        message: `This service request is in "${editingRequest.status}" status and cannot be modified. Only requests with status "NEW" can be updated.`,
        variant: 'warning',
      })
      setIsEditModalOpen(false)
      setEditingRequest(null)
      return
    }

    setIsSubmitting(true)
    const payload: UpdateCustomerServiceRequestDto = {
      addressId: Number(formAddressId),
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      category: formCategory,
      priority: formPriority,
      status: formStatus,
    }

    const res = await customerPortalService.updateServiceRequest(editingRequest.id, payload)
    if (res.success && res.payload) {
      toast.success('Service request updated successfully!')
      setIsEditModalOpen(false)
      setEditingRequest(null)
      fetchData()
    } else {
      toast.error(res.error?.message || 'Failed to update service request')
    }
    setIsSubmitting(false)
  }

  const handleDeleteRequest = async (id: number, status: string) => {
    if (status !== 'NEW') {
      alert({
        title: 'Delete Not Allowed',
        message: `This service request is in "${status}" status. Only requests with status "NEW" can be cancelled or deleted.`,
        variant: 'warning',
      })
      return
    }

    const confirmed = await confirm({
      title: 'Delete Service Request',
      message: `Are you sure you want to cancel and delete service request #${id}? This action cannot be undone.`,
      confirmText: 'Delete Request',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    if (!confirmed) return

    setDeletingId(id)
    const res = await customerPortalService.deleteServiceRequest(id)
    if (res.success) {
      toast.success('Service request deleted successfully!')
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } else {
      toast.error(res.error?.message || "Service request can't be deleted")
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <TicketIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                My Service Requests
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Request assistance, track active technician visits, and view maintenance history.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={handleOpenCreateModal}
        >
          Request Service
        </Button>
      </div>

      {/* Address alert if no addresses saved */}
      {addresses.length === 0 && !loading && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              You haven't saved any service addresses yet. Please configure your address in Settings
              to submit new service requests.
            </span>
          </div>
          <Link
            to="/settings"
            className="rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white hover:bg-amber-700 transition-colors shrink-0"
          >
            Add Address
          </Link>
        </div>
      )}

      {/* Filters Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Input
              placeholder="Search title, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<SearchIcon className="h-4 w-4" />}
            />
          </div>

          <div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[{ value: 'ALL', label: 'All Categories' }, ...CATEGORY_OPTIONS]}
            />
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'NEW', label: 'New' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'ON_HOLD', label: 'On Hold' },
                { value: 'RESOLVED', label: 'Resolved' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
          </div>

          <div>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[{ value: 'ALL', label: 'All Priorities' }, ...PRIORITY_OPTIONS]}
            />
          </div>
        </div>

        {/* Results summary & Reset filters */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredRequests.length}</strong> of{' '}
            {requests.length} requests
          </span>
          {(searchQuery ||
            statusFilter !== 'ALL' ||
            priorityFilter !== 'ALL' ||
            categoryFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('ALL')
                setPriorityFilter('ALL')
                setCategoryFilter('ALL')
              }}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <svg
            className="h-8 w-8 animate-spin text-blue-600"
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
            Loading service requests...
          </span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-center justify-between shadow-xs">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchData}>
            Retry
          </Button>
        </div>
      )}

      {/* Requests Table / Cards */}
      {!loading && !error && filteredRequests.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
            <TicketIcon className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No service requests found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            You don't have any service requests matching your criteria. Need assistance with equipment or maintenance?
          </p>
          <Button
            variant="primary"
            size="md"
            className="mt-4"
            leftIcon={<PlusIcon className="h-4 w-4" />}
            onClick={handleOpenCreateModal}
          >
            Create Service Request
          </Button>
        </div>
      )}

      {!loading && !error && filteredRequests.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 sm:pl-6">Ticket</th>
                  <th className="px-3 py-3.5">Category</th>
                  <th className="px-3 py-3.5">Priority</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5">Service Address</th>
                  <th className="px-3 py-3.5">Date Requested</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRequests.map((req) => {
                  const statusStyle = STATUS_BADGES[req.status] || STATUS_BADGES.NEW
                  const priorityStyle = PRIORITY_BADGES[req.priority] || PRIORITY_BADGES.MEDIUM
                  const addr = addressMap.get(req.addressId)

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pl-4 pr-3 sm:pl-6 font-medium text-slate-900">
                        <div className="font-semibold text-slate-900">{req.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-500">ID: #{req.id}</span>
                          {req.source?.toUpperCase() === 'EMPLOYEE' && (
                            <span className="inline-flex items-center rounded px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20">
                              Employee
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700 font-medium">
                        {req.category}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.ring}`}
                        >
                          {req.priority}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.ring}`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-slate-600 max-w-xs truncate">
                        {addr ? (
                          <span>
                            {addr.addressLine1}, {addr.city}
                          </span>
                        ) : (
                          <span className="text-slate-400">Address #{req.addressId}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-500">
                        {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6 text-right font-medium">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Action */}
                          <div className="relative group/view inline-flex items-center">
                            <button
                              type="button"
                              onClick={() => handleOpenViewModal(req)}
                              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                              title="View details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <div className="pointer-events-none absolute bottom-full right-0 mb-1.5 hidden group-hover/view:block z-30 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg">
                              View details
                              <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-slate-900" />
                            </div>
                          </div>

                          {/* Edit Action with Tooltip & Status Check */}
                          <div className="relative group/edit inline-flex items-center">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(req)}
                              disabled={req.status !== 'NEW'}
                              className={`rounded p-1 transition-colors ${
                                req.status === 'NEW'
                                  ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                                  : 'text-slate-300 opacity-40 cursor-not-allowed'
                              }`}
                              title={
                                req.status === 'NEW'
                                  ? 'Edit request'
                                  : "Only requests with status 'NEW' can be updated"
                              }
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <div className="pointer-events-none absolute bottom-full right-0 mb-1.5 hidden group-hover/edit:block z-30 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg">
                              {req.status === 'NEW'
                                ? 'Edit request'
                                : "Only requests with status 'NEW' can be updated"}
                              <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-slate-900" />
                            </div>
                          </div>

                          {/* Delete Action with Tooltip & Status Check */}
                          <div className="relative group/delete inline-flex items-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(req.id, req.status)}
                              disabled={deletingId === req.id || req.status !== 'NEW'}
                              className={`rounded p-1 transition-colors ${
                                req.status === 'NEW'
                                  ? 'text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer'
                                  : 'text-slate-300 opacity-40 cursor-not-allowed'
                              }`}
                              title={
                                req.status === 'NEW'
                                  ? 'Delete request'
                                  : "Only requests with status 'NEW' can be cancelled or deleted"
                              }
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                            <div className="pointer-events-none absolute bottom-full right-0 mb-1.5 hidden group-hover/delete:block z-30 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg">
                              {req.status === 'NEW'
                                ? 'Delete request'
                                : "Only requests with status 'NEW' can be cancelled or deleted"}
                              <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-slate-900" />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Service Request */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Request New Service</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <Select
                  label="Service Location / Address *"
                  value={formAddressId ? String(formAddressId) : ''}
                  onChange={(e) => setFormAddressId(e.target.value ? Number(e.target.value) : '')}
                  error={formErrors.addressId}
                  options={[
                    { value: '', label: '-- Select an Address --' },
                    ...addresses.map((a) => ({
                      value: String(a.id),
                      label: `${a.addressLine1}, ${a.city} ${a.isPrimary ? '(Primary)' : ''}`,
                    })),
                  ]}
                />
                {addresses.length === 0 && (
                  <p className="mt-1 text-xs text-rose-500">
                    No addresses registered. Please save an address in Settings first.
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Title / Summary *"
                  placeholder="e.g. Broken Air Conditioning Unit in Living Area"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  error={formErrors.title}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as CustomerServiceCategory)}
                  options={CATEGORY_OPTIONS}
                />

                <Select
                  label="Priority Level"
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as CustomerServicePriority)}
                  options={PRIORITY_OPTIONS}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Issue Description
                </label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide detailed description of the problem, error codes, or preferred service window..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  disabled={addresses.length === 0}
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Service Request */}
      {isEditModalOpen && editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Edit Service Request #{editingRequest.id}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <Select
                  label="Service Location / Address *"
                  value={formAddressId ? String(formAddressId) : ''}
                  onChange={(e) => setFormAddressId(e.target.value ? Number(e.target.value) : '')}
                  error={formErrors.addressId}
                  options={[
                    { value: '', label: '-- Select an Address --' },
                    ...addresses.map((a) => ({
                      value: String(a.id),
                      label: `${a.addressLine1}, ${a.city} ${a.isPrimary ? '(Primary)' : ''}`,
                    })),
                  ]}
                />
              </div>

              <div>
                <Input
                  label="Title / Summary *"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  error={formErrors.title}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as CustomerServiceCategory)}
                  options={CATEGORY_OPTIONS}
                />

                <Select
                  label="Priority Level"
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as CustomerServicePriority)}
                  options={PRIORITY_OPTIONS}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Issue Description
                </label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Details */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-medium text-slate-500">Ticket Details</span>
                <h3 className="text-base font-bold text-slate-900">
                  #{selectedRequest.id} - {selectedRequest.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <span className="font-semibold text-slate-900">{selectedRequest.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Priority:</span>
                  <span className="font-semibold text-slate-900">{selectedRequest.priority}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Category:</span>
                  <span className="font-semibold text-slate-900">{selectedRequest.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Requested At:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedRequest.requestedAt
                      ? new Date(selectedRequest.requestedAt).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
                {selectedRequest.source?.toUpperCase() === 'EMPLOYEE' && (
                  <div className="col-span-2 rounded-lg bg-indigo-50/70 p-2.5 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-medium text-indigo-600 block">Source:</span>
                      <span className="font-semibold text-indigo-900">
                        Employee {selectedRequest.createdBy ? `(#${selectedRequest.createdBy})` : ''}
                      </span>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-indigo-700 shadow-2xs border border-indigo-200">
                      Staff Created
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Service Address:</h4>
                <div className="rounded-lg border border-slate-200 p-2.5 bg-white text-slate-700">
                  {addressMap.get(selectedRequest.addressId) ? (
                    <div>
                      <p className="font-medium">
                        {addressMap.get(selectedRequest.addressId)?.addressLine1}
                      </p>
                      {addressMap.get(selectedRequest.addressId)?.addressLine2 && (
                        <p>{addressMap.get(selectedRequest.addressId)?.addressLine2}</p>
                      )}
                      <p className="text-slate-500">
                        {addressMap.get(selectedRequest.addressId)?.city},{' '}
                        {addressMap.get(selectedRequest.addressId)?.state}{' '}
                        {addressMap.get(selectedRequest.addressId)?.postalCode}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500">Address ID: {selectedRequest.addressId}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Description:</h4>
                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50 text-slate-700 whitespace-pre-wrap min-h-16">
                  {selectedRequest.description || 'No description provided.'}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="relative group/modal-edit inline-flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<PencilIcon className="h-4 w-4" />}
                  disabled={selectedRequest.status !== 'NEW'}
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleOpenEditModal(selectedRequest)
                  }}
                  title={
                    selectedRequest.status === 'NEW'
                      ? 'Edit request'
                      : "Only requests with status 'NEW' can be updated"
                  }
                >
                  Edit
                </Button>
                {selectedRequest.status !== 'NEW' && (
                  <div className="pointer-events-none absolute bottom-full left-0 mb-1.5 hidden group-hover/modal-edit:block z-30 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg">
                    Only requests with status 'NEW' can be updated
                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-900" />
                  </div>
                )}
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsViewModalOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerServicesView
