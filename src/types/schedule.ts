export const ScheduleStatus = {
  SCHEDULED: 'SCHEDULED',
  EN_ROUTE: 'EN_ROUTE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type ScheduleStatus =
  | (typeof ScheduleStatus)[keyof typeof ScheduleStatus]
  | 'SCHEDULED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | string

export interface Schedule {
  id: number
  organizationId: number
  serviceRequestId: number
  technicianId: number
  scheduledStart: string
  scheduledEnd: string
  status: ScheduleStatus
  notes?: string | null
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

export interface GetSchedulesQueryParams {
  serviceRequestId?: number
  technicianId?: number
  status?: ScheduleStatus
}
