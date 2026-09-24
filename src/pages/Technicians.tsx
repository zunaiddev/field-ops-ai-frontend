import {type FC, useCallback, useEffect, useMemo, useState} from 'react'
import toast from 'react-hot-toast'
import {Button} from '../components/ui/Button'
import {Input} from '../components/ui/Input'
import {Select} from '../components/ui/Select'
import {PlusIcon, SearchIcon, WrenchIcon} from '../components/icons'
import {TechnicianTable} from '../components/technicians/TechnicianTable'
import {AddTechnicianModal} from '../components/technicians/AddTechnicianModal'
import {TechnicianDetailsModal} from '../components/technicians/TechnicianDetailsModal'
import {UpdateAddressModal} from '../components/technicians/UpdateAddressModal'
import {UpdateStatusModal} from '../components/technicians/UpdateStatusModal'
import technicianService from '../services/technicianService'
import type {Technician, TechnicianAddress} from '../types/technician'

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
]

const AVAILABILITY_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Availabilities' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'ON_JOB', label: 'On Job' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
]

export const Technicians: FC = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [editingStatusTech, setEditingStatusTech] = useState<Technician | null>(null)
  const [tableEditingAddress, setTableEditingAddress] = useState<{
    technicianId: number
    address: TechnicianAddress
    label: string
  } | null>(null)

  const fetchTechnicians = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await technicianService.getTechnicians()
      if (response.success && response.payload) {
        setTechnicians(response.payload)
      } else {
        setError(response.error?.message || 'Failed to fetch technicians')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTechnicians()
  }, [fetchTechnicians])

  // Filter technicians
  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      const q = searchQuery.toLowerCase().trim()
      const emp = tech.employee

      const matchesSearch =
        !q ||
        emp?.firstName?.toLowerCase().includes(q) ||
        emp?.lastName?.toLowerCase().includes(q) ||
        emp?.email?.toLowerCase().includes(q) ||
        emp?.phone?.toLowerCase().includes(q) ||
        (emp?.employeeId !== undefined &&
          emp.employeeId !== null &&
          String(emp.employeeId).toLowerCase().includes(q)) ||
        String(tech.id).includes(q) ||
        tech.homeAddress?.city?.toLowerCase().includes(q) ||
        tech.homeAddress?.state?.toLowerCase().includes(q) ||
        tech.currentAddress?.city?.toLowerCase().includes(q) ||
        tech.currentAddress?.state?.toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'ALL' || tech.status === statusFilter
      const matchesAvailability =
        availabilityFilter === 'ALL' || tech.availabilityStatus === availabilityFilter

      return matchesSearch && matchesStatus && matchesAvailability
    })
  }, [technicians, searchQuery, statusFilter, availabilityFilter])

  // Handle Technician Created
  const handleTechnicianCreated = (newTech: Technician) => {
    setTechnicians((prev) => [newTech, ...prev])
  }

  // Handle View Technician
  const handleViewTechnician = (tech: Technician) => {
    setSelectedTechnician(tech)
    setIsDetailsModalOpen(true)
  }

  // Handle Delete Technician
  const handleDeleteTechnician = async (tech: Technician) => {
    try {
      const res = await technicianService.deleteTechnician(tech.id)
      if (res.success) {
        const emp = tech.employee
        const techName = emp
          ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email
          : `#${tech.id}`
        toast.success(`Technician "${techName}" deleted successfully`)
        setTechnicians((prev) => prev.filter((t) => t.id !== tech.id))
        if (selectedTechnician?.id === tech.id) {
          setIsDetailsModalOpen(false)
          setSelectedTechnician(null)
        }
      } else {
        toast.error(res.error?.message || 'Failed to delete technician')
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An error occurred while deleting technician',
      )
    }
  }

  // Handle In-Memory Status & Availability Update
  const handleStatusUpdated = (updatedPartial: {
    id: number
    status: string
    availabilityStatus: string
    updatedAt?: string
  }) => {
    // 1. Update the technician list state
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== updatedPartial.id) return t
        return {
          ...t,
          status: updatedPartial.status,
          availabilityStatus: updatedPartial.availabilityStatus,
          updatedAt: updatedPartial.updatedAt || t.updatedAt,
        }
      }),
    )

    // 2. Also update the selected technician currently open in the details modal
    setSelectedTechnician((prev) => {
      if (!prev || prev.id !== updatedPartial.id) return prev
      return {
        ...prev,
        status: updatedPartial.status,
        availabilityStatus: updatedPartial.availabilityStatus,
        updatedAt: updatedPartial.updatedAt || prev.updatedAt,
      }
    })
  }

  // Handle In-Memory Address Update without refetching from server
  const handleAddressUpdated = (
    technicianId: number,
    updatedAddress: TechnicianAddress,
  ) => {
    // 1. Update the technician list state
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== technicianId) return t
        const isHome = t.homeAddress?.id === updatedAddress.id
        const isCurrent = t.currentAddress?.id === updatedAddress.id
        return {
          ...t,
          homeAddress: isHome ? updatedAddress : t.homeAddress,
          currentAddress: isCurrent || (!isHome && (!t.currentAddress || !t.currentAddress.id)) ? updatedAddress : t.currentAddress,
        }
      }),
    )

    // 2. Also update the selected technician currently open in the details modal
    setSelectedTechnician((prev) => {
      if (!prev || prev.id !== technicianId) return prev
      const isHome = prev.homeAddress?.id === updatedAddress.id
      const isCurrent = prev.currentAddress?.id === updatedAddress.id
      return {
        ...prev,
        homeAddress: isHome ? updatedAddress : prev.homeAddress,
        currentAddress: isCurrent || (!isHome && (!prev.currentAddress || !prev.currentAddress.id)) ? updatedAddress : prev.currentAddress,
      }
    })
  }

  // Stats
  const availableCount = useMemo(
    () => technicians.filter((t) => t.availabilityStatus === 'AVAILABLE').length,
    [technicians],
  )

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <WrenchIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Technician Management
              </h1>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-700/10">
                {technicians.length} Total
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-700/10">
                {availableCount} Available
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Manage field technicians, view technical qualifications, and track current status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={fetchTechnicians}
            disabled={loading}
            title="Reload technicians from server"
          >
            <div className="flex gap-2">
              <svg
              className={`h-4 w-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
            </div>

          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusIcon className="h-4 w-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Technician
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search technician by name, email, employee ID, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<SearchIcon className="h-4 w-4" />}
            />
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={STATUS_FILTER_OPTIONS}
            />
          </div>

          <div>
            <Select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              options={AVAILABILITY_FILTER_OPTIONS}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredTechnicians.length}</strong> of{' '}
            {technicians.length} technicians
          </span>
          {(searchQuery || statusFilter !== 'ALL' || availabilityFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('ALL')
                setAvailabilityFilter('ALL')
              }}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && technicians.length === 0 && (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
          <svg
            className="h-9 w-9 animate-spin text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
          <p className="mt-4 text-sm font-medium text-slate-700">Loading technicians...</p>
          <p className="mt-1 text-xs text-slate-400">Please wait while we retrieve technician profiles.</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="mt-3 text-base font-semibold text-rose-950">Failed to load technicians</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-rose-700 sm:text-sm">{error}</p>
          <div className="mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTechnicians}
              className="border-rose-300 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Technicians Table */}
      {!error && (technicians.length > 0 || !loading) && (
        <TechnicianTable
          technicians={filteredTechnicians}
          onViewTechnician={handleViewTechnician}
          onUpdateAddress={(tech, addr, label) =>
            setTableEditingAddress({
              technicianId: tech.id,
              address: addr,
              label,
            })
          }
          onAddNewTechnician={() => setIsAddModalOpen(true)}
          onDeleteTechnician={handleDeleteTechnician}
          onUpdateStatus={(tech) => setEditingStatusTech(tech)}
        />
      )}

      {/* Add Technician Modal */}
      <AddTechnicianModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTechnicianCreated={handleTechnicianCreated}
      />

      {/* Technician Details Modal with Address Update & Delete Technician & Update Status */}
      <TechnicianDetailsModal
        isOpen={isDetailsModalOpen}
        technician={selectedTechnician}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedTechnician(null)
        }}
        onAddressUpdated={handleAddressUpdated}
        onDeleteTechnician={handleDeleteTechnician}
        onUpdateStatus={(tech) => setEditingStatusTech(tech)}
      />

      {/* Update Address Modal (Quick edit from Table or Details) */}
      {tableEditingAddress && (
        <UpdateAddressModal
          isOpen={Boolean(tableEditingAddress)}
          technicianId={tableEditingAddress.technicianId}
          address={tableEditingAddress.address}
          addressTypeLabel={tableEditingAddress.label}
          onClose={() => setTableEditingAddress(null)}
          onAddressUpdated={(updatedAddr) => {
            handleAddressUpdated(tableEditingAddress.technicianId, updatedAddr)
            setTableEditingAddress(null)
          }}
        />
      )}

      {/* Update Status & Availability Modal */}
      {editingStatusTech && (
        <UpdateStatusModal
          isOpen={Boolean(editingStatusTech)}
          technician={editingStatusTech}
          onClose={() => setEditingStatusTech(null)}
          onStatusUpdated={(updatedPartial) => {
            handleStatusUpdated(updatedPartial)
            setEditingStatusTech(null)
          }}
        />
      )}
    </div>
  )
}

export default Technicians
