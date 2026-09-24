import type { Employee } from './organization'
import type { Skill } from './skill'

export interface TechnicianAddress {
  id?: number
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  longitude?: string | number | null
  latitude?: string | number | null
  createdAt?: string
  updatedAt?: string
}

export interface Technician {
  id: number
  organizationId: number
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | string
  availabilityStatus: 'AVAILABLE' | 'UNAVAILABLE' | 'ON_JOB' | 'ON_BREAK' | string
  employee?: Employee | null
  homeAddress?: TechnicianAddress | null
  currentAddress?: TechnicianAddress | null
  lastLocationAt?: string | null
  createdAt?: string
  updatedAt?: string
  skills?: Skill[]
}

export interface CreateTechnicianAddressDto {
  addressLine1: string
  addressLine2?: string
  postalCode: string
  city: string
  state: string
  country: string
  longitude?: string | number
  latitude?: string | number
}

export interface UpdateTechnicianAddressDto {
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  longitude?: string | number | null
  latitude?: string | number | null
}

export interface CreateTechnicianDto {
  employeeId: number
  skills: number[]
  homeAddress: CreateTechnicianAddressDto
  currentAddress: CreateTechnicianAddressDto
}
