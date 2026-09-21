import { useState, useMemo, type FC } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { JobTable } from '../components/jobs/JobTable'
import { PlusIcon, SearchIcon } from '../components/icons'
import { mockJobs } from '../constants/mockData'
import type { Job } from '../types/app'

export const Jobs: FC = () => {
  const [jobs, setJobs] = useState<Job[]>(mockJobs)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.assignedEmployeeName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter
      const matchesPriority = priorityFilter === 'ALL' || job.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [jobs, searchQuery, statusFilter, priorityFilter])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Field Jobs & Dispatch
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Track operational service requests, emergency calls, and scheduled site visits.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={() => {
            const newJob: Job = {
              id: `job_${Date.now()}`,
              jobNumber: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
              title: 'HVAC Filter & Thermostat Maintenance',
              customerName: 'Omni Retail Plaza',
              customerId: 'cust_004',
              assignedEmployeeName: 'David Chen',
              assignedEmployeeId: 'emp_004',
              status: 'SCHEDULED',
              priority: 'MEDIUM',
              scheduledDate: '2026-09-23 09:30 AM',
              location: '2200 Grand Concourse, NY',
              estimatedDuration: '2.0 hrs',
            }
            setJobs((prev) => [newJob, ...prev])
          }}
        >
          Create Job
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by job title, job number, customer, tech..."
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
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'SCHEDULED', label: 'Scheduled' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'COMPLETED', label: 'Completed' },
              ]}
            />
          </div>

          <div>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Priorities' },
                { value: 'URGENT', label: 'Urgent' },
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' },
              ]}
            />
          </div>
        </div>

        {/* Results summary & Active filters pill */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredJobs.length}</strong> of{' '}
            {jobs.length} operations
          </span>
          {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('ALL')
                setPriorityFilter('ALL')
              }}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <JobTable jobs={filteredJobs} />
    </div>
  )
}

export default Jobs
