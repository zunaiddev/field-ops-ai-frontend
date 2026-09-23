import { useState, useMemo, useEffect, useCallback, type FC } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { ServiceRequestTable } from '../components/serviceRequests/ServiceRequestTable'
import { ServiceRequestDetailsModal } from '../components/serviceRequests/ServiceRequestDetailsModal'
import { CreateServiceRequestModal } from '../components/serviceRequests/CreateServiceRequestModal'
import { UpdateServiceRequestModal } from '../components/serviceRequests/UpdateServiceRequestModal'
import { PlusIcon, SearchIcon, TicketIcon } from '../components/icons'
import {
  ServiceRequestCategory,
  ServiceRequestPriority,
  type ServiceRequest,
  type PaginatedServiceRequestsResponse,
} from '../types/serviceRequest'
import serviceRequestService from '../services/serviceRequestService'

export const ServiceRequests: FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [sourceFilter, setSourceFilter] = useState('ALL')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Fetch Service Requests
  const fetchServiceRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await serviceRequestService.getServiceRequests({
        page: currentPage,
        pageSize: pageSize,
        search: searchQuery ? searchQuery.trim() : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        source: sourceFilter !== 'ALL' ? sourceFilter : undefined,
      })

      if (res.success && res.payload) {
        const payload = res.payload as PaginatedServiceRequestsResponse | { data?: ServiceRequest[]; total?: number; totalPages?: number }
        let items: ServiceRequest[] = []

        if (Array.isArray(payload)) {
          items = payload
          setTotalItems(payload.length)
          setTotalPages(Math.max(1, Math.ceil(payload.length / pageSize)))
        } else if (payload && Array.isArray(payload.data)) {
          items = payload.data
          setTotalItems(payload.total ?? payload.data.length)
          setTotalPages(payload.totalPages ?? Math.max(1, Math.ceil((payload.total ?? payload.data.length) / pageSize)))
        }

        setRequests(items)
      } else {
        setError(res.error?.message || 'Failed to load service requests')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred while fetching service requests',
      )
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, priorityFilter, categoryFilter, sourceFilter])

  useEffect(() => {
    fetchServiceRequests()
  }, [fetchServiceRequests])

  // Client-side fallback filtering when needed
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        req.title?.toLowerCase().includes(q) ||
        req.description?.toLowerCase().includes(q) ||
        String(req.id).includes(q) ||
        String(req.customerId).includes(q) ||
        req.category?.toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
      const matchesPriority = priorityFilter === 'ALL' || req.priority === priorityFilter
      const matchesCategory = categoryFilter === 'ALL' || req.category === categoryFilter
      const matchesSource = sourceFilter === 'ALL' || req.source === sourceFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesSource
    })
  }, [requests, searchQuery, statusFilter, priorityFilter, categoryFilter, sourceFilter])

  const handleOpenViewModal = (req: ServiceRequest) => {
    setSelectedRequest(req)
    setIsViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedRequest(null)
  }

  const handleOpenEditModal = (req: ServiceRequest) => {
    setEditingRequest(req)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingRequest(null)
  }

  const handleRequestCreated = (newReq: ServiceRequest) => {
    setRequests((prev) => [newReq, ...prev])
    setTotalItems((prev) => prev + 1)
  }

  const handleRequestUpdated = (updatedReq: ServiceRequest) => {
    setRequests((prev) =>
      prev.map((r) => (Number(r.id) === Number(updatedReq.id) ? { ...r, ...updatedReq } : r)),
    )
    if (selectedRequest && Number(selectedRequest.id) === Number(updatedReq.id)) {
      setSelectedRequest((prev) => (prev ? { ...prev, ...updatedReq } : updatedReq))
    }
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('ALL')
    setPriorityFilter('ALL')
    setCategoryFilter('ALL')
    setSourceFilter('ALL')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <TicketIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Service Requests
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Manage incoming customer service tickets, dispatch inquiries, and maintenance logs.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Request
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Input
              placeholder="Search title, ID, customer..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              leftIcon={<SearchIcon className="h-4 w-4" />}
            />
          </div>

          <div>
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: ServiceRequestCategory.NETWORK, label: 'Network' },
                { value: ServiceRequestCategory.INSTALLATION, label: 'Installation' },
                { value: ServiceRequestCategory.REPAIR, label: 'Repair' },
                { value: ServiceRequestCategory.MAINTENANCE, label: 'Maintenance' },
                { value: ServiceRequestCategory.INSPECTION, label: 'Inspection' },
                { value: ServiceRequestCategory.OTHER, label: 'Other' },
              ]}
            />
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'NEW', label: 'New' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'ASSIGNED', label: 'Assigned' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'RESOLVED', label: 'Resolved' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
                { value: 'REJECTED', label: 'Rejected' },
              ]}
            />
          </div>

          <div>
            <Select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value)
                setCurrentPage(1)
              }}
              options={[
                { value: 'ALL', label: 'All Priorities' },
                { value: ServiceRequestPriority.CRITICAL, label: 'Critical' },
                { value: ServiceRequestPriority.HIGH, label: 'High' },
                { value: ServiceRequestPriority.MEDIUM, label: 'Medium' },
                { value: ServiceRequestPriority.LOW, label: 'Low' },
              ]}
            />
          </div>

          <div>
            <Select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value)
                setCurrentPage(1)
              }}
              options={[
                { value: 'ALL', label: 'All Sources' },
                { value: 'EMPLOYEE', label: 'Employee' },
                { value: 'CUSTOMER', label: 'Customer' },
                { value: 'PORTAL', label: 'Portal' },
                { value: 'PHONE', label: 'Phone' },
                { value: 'EMAIL', label: 'Email' },
              ]}
            />
          </div>
        </div>

        {/* Results summary & Active filters pill */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredRequests.length}</strong> of{' '}
            {totalItems || requests.length} service requests
          </span>
          {(searchQuery ||
            statusFilter !== 'ALL' ||
            priorityFilter !== 'ALL' ||
            categoryFilter !== 'ALL' ||
            sourceFilter !== 'ALL') && (
            <button
              type="button"
              onClick={handleResetFilters}
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

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-rose-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchServiceRequests}
            className="rounded-lg bg-white px-3 py-1.5 font-semibold text-rose-700 border border-rose-200 shadow-2xs hover:bg-rose-100/50 cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table */}
      {!loading && !error && (
        <ServiceRequestTable
          requests={filteredRequests}
          onViewRequest={handleOpenViewModal}
          onEditRequest={handleOpenEditModal}
        />
      )}

      {/* Pagination Controls */}
      {!loading && !error && requests.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-xs text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-slate-400">|</span>
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal: View Details */}
      <ServiceRequestDetailsModal
        isOpen={isViewModalOpen}
        request={selectedRequest}
        onClose={handleCloseViewModal}
        onEditRequest={(req) => {
          handleCloseViewModal()
          handleOpenEditModal(req)
        }}
      />

      {/* Modal: Create Request */}
      <CreateServiceRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRequestCreated={handleRequestCreated}
      />

      {/* Modal: Update Request */}
      <UpdateServiceRequestModal
        isOpen={isEditModalOpen}
        request={editingRequest}
        onClose={handleCloseEditModal}
        onRequestUpdated={handleRequestUpdated}
      />
    </div>
  )
}

export default ServiceRequests
