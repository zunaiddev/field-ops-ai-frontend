import { useState, useEffect, useMemo, type FC, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { PlusIcon, SearchIcon, CalendarIcon } from '../components/icons'
import { ScheduleTable } from '../components/schedules/ScheduleTable'
import { CreateScheduleModal } from '../components/schedules/CreateScheduleModal'
import { ScheduleDetailsModal } from '../components/schedules/ScheduleDetailsModal'
import type { Schedule } from '../types/schedule'
import type { Technician } from '../types/technician'
import scheduleService from '../services/scheduleService'
import serviceRequestService from '../services/serviceRequestService'
import technicianService from '../services/technicianService'
import { useAlertModal } from '../context/AlertModalContext'

export const Schedules: FC = () => {
  const { confirm } = useAlertModal()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Fetch Schedules & Technicians
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [schedRes, techRes] = await Promise.allSettled([
        scheduleService.getSchedules(),
        technicianService.getTechnicians(),
      ])

      if (schedRes.status === 'fulfilled' && schedRes.value.success && schedRes.value.payload) {
        setSchedules(schedRes.value.payload)
      } else if (schedRes.status === 'fulfilled' && !schedRes.value.success) {
        toast.error(schedRes.value.error?.message || 'Failed to fetch schedules')
      }

      if (techRes.status === 'fulfilled' && techRes.value.success && techRes.value.payload) {
        setTechnicians(techRes.value.payload)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error fetching schedules')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        s.id.toString().includes(searchQuery.trim()) ||
        s.serviceRequestId.toString().includes(searchQuery.trim()) ||
        s.technicianId.toString().includes(searchQuery.trim()) ||
        (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [schedules, searchQuery, statusFilter])

  // Handle schedule creation callback
  const handleScheduleCreated = (newSchedule: Schedule) => {
    setSchedules((prev) => [newSchedule, ...prev])
  }

  // Handle schedule deletion: delete schedule AND update service request status to ON_HOLD
  const handleDeleteSchedule = async (schedule: Schedule) => {
    const isConfirmed = await confirm({
      title: 'Delete Schedule',
      message: `Are you sure you want to delete Schedule #${schedule.id}? The associated Service Request (#${schedule.serviceRequestId}) status will be set to ON_HOLD.`,
      confirmText: 'Delete Schedule',
      cancelText: 'Cancel',
      variant: 'danger',
    })

    if (!isConfirmed) return

    try {
      const delRes = await scheduleService.deleteSchedule(schedule.id)
      if (!delRes.success && delRes.status !== 204 && delRes.status !== 200) {
        toast.error(delRes.error?.message || 'Failed to delete schedule')
        return
      }

      // Update service request status to ON_HOLD as requested
      try {
        await serviceRequestService.updateServiceRequest(schedule.serviceRequestId, {
          status: 'ON_HOLD',
        })
      } catch (err) {
        console.error('Failed to update service request status to ON_HOLD:', err)
      }

      toast.success('Schedule deleted. Service request status updated to ON_HOLD.')
      setSchedules((prev) => prev.filter((s) => s.id !== schedule.id))
      if (selectedSchedule?.id === schedule.id) {
        setIsDetailsModalOpen(false)
        setSelectedSchedule(null)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error deleting schedule')
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Create Schedule Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Schedules
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Manage technician dispatch appointments and track scheduled field operations.
            </p>
          </div>
        </div>

        {/* Button over the schedules list */}
        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Schedule
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by schedule ID, request ID, tech ID, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<SearchIcon className="h-4 w-4" />}
            />
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'SCHEDULED', label: 'Scheduled' },
                { value: 'DISPATCHED', label: 'Dispatched' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
          </div>

          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
              onClick={loadData}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Results summary & Active filters pill */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredSchedules.length}</strong> of{' '}
            {schedules.length} schedules
          </span>
          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('ALL')
              }}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton or Schedules Table */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-200/80 bg-white p-8 text-center shadow-2xs">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-xs font-medium text-slate-500">Loading schedules...</p>
        </div>
      ) : (
        <ScheduleTable
          schedules={filteredSchedules}
          technicians={technicians}
          onViewSchedule={(sched) => {
            setSelectedSchedule(sched)
            setIsDetailsModalOpen(true)
          }}
          onDeleteSchedule={handleDeleteSchedule}
        />
      )}

      {/* Create Schedule Modal */}
      <CreateScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onScheduleCreated={handleScheduleCreated}
      />

      {/* View Schedule Details Modal */}
      <ScheduleDetailsModal
        schedule={selectedSchedule}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedSchedule(null)
        }}
        onScheduleDeleted={(schedId) => {
          setSchedules((prev) => prev.filter((s) => s.id !== schedId))
        }}
      />
    </div>
  )
}

export default Schedules
