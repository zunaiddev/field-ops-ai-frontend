export type CustomerHistoryAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'ADDRESS_CREATED'
  | 'ADDRESS_UPDATED'
  | 'ADDRESS_DELETED'
  | string

export interface CustomerHistoryRes {
  id: number
  customerId: number
  organizationId: number
  action: CustomerHistoryAction
  description?: string | null
  createdBy?: number | null
  createdAt: string
  [key: string]: unknown
}

export interface CustomerAddressRes {
  id: number
  customerId: number
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  isPrimary?: boolean
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

export interface CreateAddressDto {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isPrimary?: boolean
}

export interface UpdateAddressDto {
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  isPrimary?: boolean
}

export interface Customer {
  id: number
  organizationId: number
  name: string
  email: string
  phone?: string | null
  externalReference?: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | string
  createdAt: string
  updatedAt: string
  addresses?: CustomerAddressRes[]
}

export interface PaginatedCustomersResponse {
  data: Customer[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface GetCustomersQueryParams {
  page?: number
  pageSize?: number
  name?: string
  email?: string
}

export interface CreateCustomerDto {
  name: string
  phone: string
  email: string
  externalReference?: string
  status: string
}

export interface UpdateCustomerDto {
  name?: string
  phone?: string
  email?: string
  externalReference?: string
  status?: string
}
