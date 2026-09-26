export const ScheduleStatus = {
  SCHEDULED: 'SCHEDULED',
  DISPATCHED: 'DISPATCHED',
  EN_ROUTE: 'DISPATCHED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type ScheduleStatus =
  | (typeof ScheduleStatus)[keyof typeof ScheduleStatus]
  | 'SCHEDULED'
  | 'DISPATCHED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | string

export interface CustomerSummary {
  id: number
  organizationId?: number
  name: string
  phone?: string
  email: string
}

export interface AddressSummary {
  id: number
  customerId?: number
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface ScheduleServiceRequestSummary {
  id: number
  title: string
  description?: string
  category?: string
  priority?: string
  status?: string
}

export interface Schedule {
  id: number
  organizationId: number
  serviceRequestId: number
  technicianId: number
  scheduledStart: string
  scheduledEnd: string
  status: ScheduleStatus
  notes?: string | null
  customer?: CustomerSummary
  address?: AddressSummary
  serviceRequest?: ScheduleServiceRequestSummary | any
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

export interface CreateSchedulePayload {
  serviceRequestId: number
  technicianId: number
  scheduledStart: string
  scheduledEnd: string
  notes?: string
}

export interface UpdateSchedulePayload {
  technicianId?: number
  scheduledStart?: string
  scheduledEnd?: string
  status?: ScheduleStatus
  notes?: string
}

export interface UpdateTechnicianScheduleStatusPayload {
  status: ScheduleStatus | string
  notes?: string
}

export interface GetSchedulesQueryParams {
  serviceRequestId?: number
  technicianId?: number
  status?: ScheduleStatus
}
