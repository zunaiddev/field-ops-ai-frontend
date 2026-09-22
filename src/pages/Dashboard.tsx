import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { DashboardOverview } from '../components/dashboard/DashboardOverview'
import { Button } from '../components/ui/Button'
import { PlusIcon } from '../components/icons'
import { useCurrentUser } from '../context/UserContext'
import {
  mockCustomers,
  mockDashboardStats,
  mockEmployees,
  mockJobs,
} from '../constants/mockData'

export const Dashboard: FC = () => {
  const { currentUser } = useCurrentUser()
  const canManageStaff = ['OWNER', 'ORG_OWNER', 'ADMIN', 'ORG_ADMIN', 'MANAGER'].includes(
    currentUser.role,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Dashboard
            </h1>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-700/10">
              {currentUser.role}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Overview of your organization's field operations and operational telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {canManageStaff && (
            <Link to="/employees">
              <Button variant="outline" size="sm">
                Manage Staff
              </Button>
            </Link>
          )}
          <Link to="/jobs">
            <Button variant="primary" size="sm" leftIcon={<PlusIcon className="h-4 w-4" />}>
              Create Job
            </Button>
          </Link>
        </div>
      </div>

      <DashboardOverview
        stats={mockDashboardStats}
        jobs={mockJobs}
        employees={mockEmployees}
        customers={mockCustomers}
      />
    </div>
  )
}

export default Dashboard
