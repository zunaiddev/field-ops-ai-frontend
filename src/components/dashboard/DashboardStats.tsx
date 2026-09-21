import type { FC } from 'react'
import { BuildingIcon, ClockIcon, UsersIcon, WrenchIcon } from '../icons'
import type { DashboardStatsData } from '../../types/app'

interface DashboardStatsProps {
  stats: DashboardStatsData
  isEmployeeRole?: boolean
}

export const DashboardStats: FC<DashboardStatsProps> = ({ stats, isEmployeeRole = false }) => {
  // If role is EMPLOYEE, adjust the stats representation to show employee-focused metrics
  const cards = [
    {
      title: isEmployeeRole ? 'Team Members' : stats.totalEmployees.label,
      value: stats.totalEmployees.value,
      change: stats.totalEmployees.change,
      isPositive: stats.totalEmployees.isPositive,
      description: stats.totalEmployees.description,
      icon: UsersIcon,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      title: isEmployeeRole ? 'Active Client Accounts' : stats.totalCustomers.label,
      value: stats.totalCustomers.value,
      change: stats.totalCustomers.change,
      isPositive: stats.totalCustomers.isPositive,
      description: stats.totalCustomers.description,
      icon: BuildingIcon,
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: isEmployeeRole ? 'My Active Jobs' : stats.activeJobs.label,
      value: isEmployeeRole ? 4 : stats.activeJobs.value,
      change: isEmployeeRole ? '2 in progress' : stats.activeJobs.change,
      isPositive: true,
      description: isEmployeeRole ? '2 scheduled for afternoon' : stats.activeJobs.description,
      icon: WrenchIcon,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: isEmployeeRole ? 'Pending Dispatch' : stats.pendingJobs.label,
      value: isEmployeeRole ? 1 : stats.pendingJobs.value,
      change: stats.pendingJobs.change,
      isPositive: stats.pendingJobs.isPositive,
      description: stats.pendingJobs.description,
      icon: ClockIcon,
      iconBg: 'bg-amber-50 text-amber-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{card.title}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">{card.value}</span>
              {card.change && (
                <span
                  className={`text-xs font-medium ${
                    card.isPositive ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {card.change}
                </span>
              )}
            </div>

            {card.description && (
              <p className="mt-2 text-xs text-slate-500">{card.description}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default DashboardStats
