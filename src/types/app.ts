import type { FC } from 'react'

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

export interface CurrentUser {
  id: string
  name: string
  email: string
  role: UserRole
  organizationName: string
  avatarUrl?: string
}

export interface NavigationItem {
  label: string
  path: string
  icon: FC<{ className?: string }>
  roles?: UserRole[]
  badge?: string | number
}

export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'

export interface Employee {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone: string
  role: UserRole
  department: string
  status: EmployeeStatus
  assignedJobsCount: number
  joinedDate: string
  avatarColor?: string
}

export type CustomerStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE'

export interface Customer {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  status: CustomerStatus
  totalJobs: number
  lastServiceDate: string
}

export type JobStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | 'CANCELLED'
export type JobPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Job {
  id: string
  jobNumber: string
  title: string
  customerName: string
  customerId: string
  assignedEmployeeName: string
  assignedEmployeeId: string
  status: JobStatus
  priority: JobPriority
  scheduledDate: string
  location: string
  estimatedDuration?: string
}

export interface StatItem {
  label: string
  value: string | number
  change?: string
  isPositive?: boolean
  description?: string
}

export interface DashboardStatsData {
  totalEmployees: StatItem
  totalCustomers: StatItem
  activeJobs: StatItem
  pendingJobs: StatItem
}
