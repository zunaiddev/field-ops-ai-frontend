import {type FC, useCallback, useEffect, useMemo, useState} from 'react'
import toast from 'react-hot-toast'
import {Button} from '../components/ui/Button'
import {Input} from '../components/ui/Input'
import {Select} from '../components/ui/Select'
import {EmployeeTable} from '../components/employees/EmployeeTable'
import {AddEmployeeModal} from '../components/employees/AddEmployeeModal'
import {EmployeeDetailsModal} from '../components/employees/EmployeeDetailsModal'
import {EditEmployeeModal} from '../components/employees/EditEmployeeModal'
import {PlusIcon, SearchIcon} from '../components/icons'
import dashboardService from '../services/dashboardService'
import type {Employee} from '../types/organization'
import {EMPLOYEE_ROLE_FILTER_OPTIONS, EMPLOYEE_STATUS_FILTER_OPTIONS} from '../constants/employee'

export const Employees: FC = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardService.getEmployees()
      if (response.success && response.payload?.employees) {
        setEmployees(response.payload.employees)
      } else {
        setError(response.error?.message || 'Failed to fetch employees')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        emp.firstName?.toLowerCase().includes(query) ||
        emp.lastName?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        emp.phone?.toLowerCase().includes(query)

      const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter
      const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [employees, searchQuery, roleFilter, statusFilter])

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees((prev) => [newEmployee, ...prev])
  }

  const handleViewEmployee = (emp: Employee) => {
    setSelectedEmployee(emp)
    setIsDetailModalOpen(true)
  }

  const handleOpenEditFromDetails = (emp: Employee) => {
    setSelectedEmployee(emp)
    setIsDetailModalOpen(false)
    setIsEditModalOpen(true)
  }

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
    )
    setSelectedEmployee(updatedEmployee)
  }

  const handleDeleteEmployee = async (emp: Employee) => {
    try {
      const response = await dashboardService.deleteMember(emp.id)
      if (response.success) {
        toast.success('Member removed successfully')
        setIsDetailModalOpen(false)
        setSelectedEmployee(null)
        fetchEmployees()
      } else {
        toast.error(response.error?.message || 'Failed to remove member')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while removing member')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Employees
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Manage your field technicians, operational staff, and service dispatchers.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Employee
        </Button>
      </div>

      {loading && (
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
          <p className="mt-4 text-sm font-medium text-slate-700">Loading team members...</p>
          <p className="mt-1 text-xs text-slate-400">Please wait while we retrieve the employees list.</p>
        </div>
      )}

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
          <h3 className="mt-3 text-base font-semibold text-rose-950">Failed to load employees</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-rose-700 sm:text-sm">{error}</p>
          <div className="mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEmployees}
              className="border-rose-300 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <Input
                  placeholder="Search by name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<SearchIcon className="h-4 w-4" />}
                />
              </div>

              <div>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  options={[...EMPLOYEE_ROLE_FILTER_OPTIONS]}
                />
              </div>

              <div>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[...EMPLOYEE_STATUS_FILTER_OPTIONS]}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>
                Showing <strong className="text-slate-900">{filteredEmployees.length}</strong> of{' '}
                {employees.length} team members
              </span>
              {(searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setRoleFilter('ALL')
                    setStatusFilter('ALL')
                  }}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          <EmployeeTable
            employees={filteredEmployees}
            onViewEmployee={handleViewEmployee}
          />
        </>
      )}

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        addEmployee={handleAddEmployee}
      />

      <EmployeeDetailsModal
        isOpen={isDetailModalOpen}
        employee={selectedEmployee}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedEmployee(null)
        }}
        onEdit={handleOpenEditFromDetails}
        onDelete={handleDeleteEmployee}
      />

      <EditEmployeeModal
        isOpen={isEditModalOpen}
        employee={selectedEmployee}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedEmployee(null)
        }}
        updateEmployee={handleUpdateEmployee}
      />
    </div>
  )
}

export default Employees
