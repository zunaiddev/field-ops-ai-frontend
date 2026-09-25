export interface CustomerOrganization {
  id: number
  name: string
  slug: string
  status: string
  timezone: string
  currency: string
  createdAt: string
  updatedAt: string
}

export interface CustomerProfile {
  id: number
  organizationId: number
  name: string
  phone?: string | null
  email: string
  externalReference?: string | null
  status: string
  organization?: CustomerOrganization
  createdAt: string
  updatedAt: string
}

export interface UpdateCustomerProfileDto {
  name: string
  phone?: string
}

export interface CustomerAddress {
  id: number
  customerId: number
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerAddressDto {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isPrimary?: boolean
}

export interface UpdateCustomerAddressDto {
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  isPrimary?: boolean
}

export type CustomerServiceCategory =
  | 'NETWORK'
  | 'INSTALLATION'
  | 'REPAIR'
  | 'MAINTENANCE'
  | 'INSPECTION'
  | 'OTHER'

export type CustomerServicePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type CustomerServiceStatus =
  | 'NEW'
  | 'PENDING'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'RESOLVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | string

export interface CustomerScheduleTechnician {
  id: number
  name?: string
  firstName?: string
  lastName?: string
  phone?: string | null
  email?: string | null
}

export interface CustomerServiceSchedule {
  id: number
  serviceRequestId: number
  scheduledStart: string
  scheduledEnd: string
  status: string
  notes?: string | null
  technician?: CustomerScheduleTechnician | null
  createdAt: string
  updatedAt: string
}

export interface CustomerServiceRequest {
  id: number
  organizationId: number
  customerId: number
  addressId: number
  createdBy: number
  title: string
  description?: string
  category: CustomerServiceCategory
  priority: CustomerServicePriority
  status: CustomerServiceStatus
  source: string
  requestedAt: string
  slaDueAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerServiceRequestDto {
  customerId?: number
  addressId: number
  title: string
  description?: string
  category: CustomerServiceCategory
  priority: CustomerServicePriority
}

export interface UpdateCustomerServiceRequestDto {
  addressId?: number
  title?: string
  description?: string
  category?: CustomerServiceCategory
  priority?: CustomerServicePriority
  status?: CustomerServiceStatus
}
