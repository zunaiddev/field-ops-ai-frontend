import type { FC } from 'react'
import { DashboardStats } from './DashboardStats'
import { RecentJobs } from './RecentJobs'
import { RecentEmployees } from './RecentEmployees'
import { RecentCustomers } from './RecentCustomers'
import { useCurrentUser } from '../../context/UserContext'
import type { Customer, DashboardStatsData, Employee, Job } from '../../types/app'

interface DashboardOverviewProps {
  stats: DashboardStatsData
  jobs: Job[]
  employees: Employee[]
  customers: Customer[]
}

export const DashboardOverview: FC<DashboardOverviewProps> = ({
  stats,
  jobs,
  employees,
  customers,
}) => {
  const { currentUser } = useCurrentUser()
  const isEmployeeRole = currentUser.role === 'EMPLOYEE'

  // If role is EMPLOYEE, filter jobs assigned to this employee (or demo subset)
  const displayedJobs = isEmployeeRole
    ? jobs.filter((j) => j.assignedEmployeeName === 'David Chen' || j.assignedEmployeeName === 'Sofia Bennett')
    : jobs

  return (
    <div className="space-y-6">
      {/* 1. Metric Stats Row */}
      <DashboardStats stats={stats} isEmployeeRole={isEmployeeRole} />

      {/* 2. Operational Tables Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Workload: Recent Jobs (takes 2 cols on lg screens, 3 cols if employee) */}
        <div className={isEmployeeRole ? 'lg:col-span-2 space-y-6' : 'lg:col-span-2 space-y-6'}>
          <RecentJobs
            jobs={displayedJobs}
            title={isEmployeeRole ? 'My Assigned Operations' : 'Recent Field Operations'}
          />
        </div>

        {/* Side Operational Columns */}
        <div className="space-y-6 lg:col-span-1">
          {/* Recent Employees: Only shown for OWNER, ADMIN, MANAGER */}
          {!isEmployeeRole && (
            <RecentEmployees employees={employees} />
          )}

          {/* Recent Customers */}
          <RecentCustomers customers={customers} />
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
