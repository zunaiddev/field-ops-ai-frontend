export const ServiceRequestCategory = {
  NETWORK: 'NETWORK',
  INSTALLATION: 'INSTALLATION',
  REPAIR: 'REPAIR',
  MAINTENANCE: 'MAINTENANCE',
  INSPECTION: 'INSPECTION',
  OTHER: 'OTHER',
} as const

export type ServiceRequestCategory =
  (typeof ServiceRequestCategory)[keyof typeof ServiceRequestCategory]

export const ServiceRequestPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const

export type ServiceRequestPriority =
  (typeof ServiceRequestPriority)[keyof typeof ServiceRequestPriority]

export type ServiceRequestStatus =
  | 'NEW'
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | string

export type ServiceRequestSource =
  | 'EMPLOYEE'
  | 'CUSTOMER'
  | 'PORTAL'
  | 'PHONE'
  | 'EMAIL'
  | 'SYSTEM'
  | string

export interface ServiceRequest {
  id: number
  organizationId: number
  customerId: number
  addressId?: number | null
  createdBy?: number | null
  title: string
  description: string
  category: ServiceRequestCategory | string
  priority: ServiceRequestPriority | string
  status: ServiceRequestStatus
  source: ServiceRequestSource
  requestedAt: string
  slaDueAt?: string | null
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

export interface PaginatedServiceRequestsResponse {
  data: ServiceRequest[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface GetServiceRequestsQueryParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  priority?: string
  category?: string
  source?: string
  customerId?: number | string
}

export interface CreateServiceRequestDto {
  customerId: number
  addressId: number
  title: string
  description: string
  category: ServiceRequestCategory | string
  priority: ServiceRequestPriority | string
  source?: string
  requestedAt?: string
  slaDueAt?: string | null
}

export interface UpdateServiceRequestDto {
  addressId?: number | null
  title?: string
  description?: string
  category?: ServiceRequestCategory | string
  priority?: ServiceRequestPriority | string
  status?: ServiceRequestStatus
}
