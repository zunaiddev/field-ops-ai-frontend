import { useState, useEffect, useCallback, useMemo, type FC } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { CustomerTable } from '../components/customers/CustomerTable'
import { AddCustomerModal } from '../components/customers/AddCustomerModal'
import { CustomerDetailsModal } from '../components/customers/CustomerDetailsModal'
import { PlusIcon, SearchIcon } from '../components/icons'
import customerService from '../services/customerService'
import type { Customer } from '../types/customer'

export const Customers: FC = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalPages, setTotalPages] = useState<number>(1)

  const [nameInput, setNameInput] = useState<string>('')
  const [emailInput, setEmailInput] = useState<string>('')
  const [debouncedName, setDebouncedName] = useState<string>('')
  const [debouncedEmail, setDebouncedEmail] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [modalInitialTab, setModalInitialTab] = useState<'addresses' | 'history'>('addresses')
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedName(nameInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(handler)
  }, [nameInput])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEmail(emailInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(handler)
  }, [emailInput])

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await customerService.getCustomers({
        page,
        pageSize,
        name: debouncedName.trim() || undefined,
        email: debouncedEmail.trim() || undefined,
      })

      if (response.success && response.payload) {
        setCustomers(response.payload.data || [])
        setTotal(response.payload.total ?? 0)
        setTotalPages(response.payload.totalPages ?? 1)
      } else {
        setError(response.error?.message || 'Failed to fetch customers')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, debouncedName, debouncedEmail])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const filteredCustomers = useMemo(() => {
    if (statusFilter === 'ALL') return customers
    return customers.filter((cust) => cust.status === statusFilter)
  }, [customers, statusFilter])

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev])
    setTotal((prev) => prev + 1)
  }

  const handleViewCustomer = (customer: Customer, tab: 'addresses' | 'history' = 'addresses') => {
    setSelectedCustomer(customer)
    setModalInitialTab(tab)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteCustomer = async (customerOrId: Customer | number) => {
    const customerId = typeof customerOrId === 'number' ? customerOrId : customerOrId.id
    try {
      const res = await customerService.deleteCustomer(customerId)
      if (res.success) {
        toast.success('Customer deleted successfully')
        setCustomers((prev) => prev.filter((c) => c.id !== customerId))
        setTotal((prev) => Math.max(0, prev - 1))
        if (selectedCustomer?.id === customerId) {
          setIsDetailsModalOpen(false)
          setSelectedCustomer(null)
        }
      } else {
        toast.error(res.error?.message || 'Failed to delete customer')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while deleting customer')
    }
  }

  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? { ...c, ...updatedCustomer } : c)),
    )
    if (selectedCustomer?.id === updatedCustomer.id) {
      setSelectedCustomer(updatedCustomer)
    }
  }

  const handleResetFilters = () => {
    setNameInput('')
    setEmailInput('')
    setDebouncedName('')
    setDebouncedEmail('')
    setStatusFilter('ALL')
    setPage(1)
  }

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Customers
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            View and manage customer accounts, addresses, audit history, and client information.
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

      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Input
              placeholder="Filter by customer name..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              leftIcon={<SearchIcon className="h-4 w-4" />}
            />
          </div>

          <div>
            <Input
              placeholder="Filter by email address..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              leftIcon={<SearchIcon className="h-4 w-4" />}
            />
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Contracts' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredCustomers.length}</strong> records (Page {page} of {totalPages}, Total: {total})
          </span>
          {(nameInput || emailInput || statusFilter !== 'ALL') && (
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

      {loading && customers.length === 0 && (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
          <svg
            className="h-9 w-9 animate-spin text-teal-600"
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
          <p className="mt-4 text-sm font-medium text-slate-700">Loading customer accounts...</p>
          <p className="mt-1 text-xs text-slate-400">Please wait while we retrieve customer records.</p>
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
          <h3 className="mt-3 text-base font-semibold text-rose-950">Failed to load customers</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-rose-700 sm:text-sm">{error}</p>
          <div className="mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCustomers}
              className="border-rose-300 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {(!error && (customers.length > 0 || !loading)) && (
        <div className="relative space-y-4">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-md border border-slate-200">
                <svg
                  className="h-4 w-4 animate-spin text-teal-600"
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
                <span className="text-xs font-medium text-slate-700">Updating...</span>
              </div>
            </div>
          )}

          <CustomerTable
            customers={filteredCustomers}
            onViewCustomer={handleViewCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />

          {total > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white px-4 py-3 sm:flex-row shadow-xs">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Items per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPage(1)
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-slate-400">|</span>
                <span>
                  Showing {startItem}–{endItem} of {total}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <span className="text-xs font-medium text-slate-700 px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        addCustomer={handleAddCustomer}
      />

      <CustomerDetailsModal
        isOpen={isDetailsModalOpen}
        customer={selectedCustomer}
        initialTab={modalInitialTab}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedCustomer(null)
        }}
        onDeleteCustomer={handleDeleteCustomer}
        onCustomerUpdated={handleCustomerUpdated}
      />
    </div>
  )
}

export default Customers
