import { useState, useMemo, type FC } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { CustomerTable } from '../components/customers/CustomerTable'
import { AddCustomerModal } from '../components/customers/AddCustomerModal'
import { PlusIcon, SearchIcon } from '../components/icons'
import { mockCustomers } from '../constants/mockData'
import type { Customer } from '../types/app'

export const Customers: FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchesSearch =
        cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.city.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || cust.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [customers, searchQuery, statusFilter])

  const handleAddCustomer = (
    newCustomerData: Omit<Customer, 'id' | 'totalJobs' | 'lastServiceDate'>,
  ) => {
    const newCust: Customer = {
      ...newCustomerData,
      id: `cust_${Date.now()}`,
      totalJobs: 0,
      lastServiceDate: new Date().toISOString().split('T')[0],
    }
    setCustomers((prev) => [newCust, ...prev])
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Customers
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            View and manage customer accounts, facility service locations, and client history.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Customer
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Search Input */}
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by company name, contact person, email, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<SearchIcon className="h-4 w-4" />}
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Contracts' },
                { value: 'PENDING', label: 'Pending Onboarding' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </div>
        </div>

        {/* Results summary & Active filters pill */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredCustomers.length}</strong> of{' '}
            {customers.length} customer accounts
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

      {/* Customer List Table */}
      <CustomerTable customers={filteredCustomers} />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCustomer}
      />
    </div>
  )
}

export default Customers
