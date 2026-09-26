import ApiResponse from '../api/ApiResponse'
import { protectedApi } from '../api/axios'
import type { AxiosResponse } from 'axios'
import type {
  CreateSchedulePayload,
  Schedule,
  UpdateSchedulePayload,
  UpdateTechnicianScheduleStatusPayload,
} from '../types/schedule'

class ScheduleService {
  /**
   * List all schedules in the organization (Manager / Admin).
   */
  async getSchedules(): Promise<ApiResponse<Schedule[]>> {
    try {
      const response: AxiosResponse = await protectedApi.get('/schedules')
      let list: Schedule[] = []
      if (Array.isArray(response.data)) {
        list = response.data
      } else if (response.data && Array.isArray(response.data.data)) {
        list = response.data.data
      }
      return ApiResponse.success<Schedule[]>({
        ...response,
        data: list,
      })
    } catch (err) {
      return ApiResponse.error<Schedule[]>(err)
    }
  }

  /**
   * Get assigned schedules with customer and address details (Technician).
   * Optional status filter: SCHEDULED, DISPATCHED, IN_PROGRESS, COMPLETED, CANCELLED.
   */
  async getTechnicianSchedules(status?: string): Promise<ApiResponse<Schedule[]>> {
    try {
      const response: AxiosResponse = await protectedApi.get('/schedules/technician', {
        params: status && status !== 'ALL' ? { status } : undefined,
      })
      let list: Schedule[] = []
      if (Array.isArray(response.data)) {
        list = response.data
      } else if (response.data && Array.isArray(response.data.data)) {
        list = response.data.data
      }
      return ApiResponse.success<Schedule[]>({
        ...response,
        data: list,
      })
    } catch (err) {
      return ApiResponse.error<Schedule[]>(err)
    }
  }

  /**
   * Update technician schedule status and notes (Technician).
   */
  async updateTechnicianScheduleStatus(
    id: number | string,
    payload: UpdateTechnicianScheduleStatusPayload,
  ): Promise<ApiResponse<Schedule>> {
    try {
      const response: AxiosResponse = await protectedApi.patch(
        `/schedules/technician/${id}/status`,
        payload,
      )
      const data: Schedule = response.data?.data || response.data
      return ApiResponse.success<Schedule>({
        ...response,
        data,
      })
    } catch (err) {
      return ApiResponse.error<Schedule>(err)
    }
  }

  async getScheduleByServiceId(serviceId: number | string): Promise<ApiResponse<Schedule>> {
    try {
      const response: AxiosResponse = await protectedApi.get(`/schedules/services/${serviceId}`)
      const data: Schedule = response.data?.data || response.data
      return ApiResponse.success<Schedule>({
        ...response,
        data,
      })
    } catch (err) {
      return ApiResponse.error<Schedule>(err)
    }
  }

  async getScheduleById(id: number | string): Promise<ApiResponse<Schedule>> {
    try {
      const response: AxiosResponse = await protectedApi.get(`/schedules/${id}`)
      const data: Schedule = response.data?.data || response.data
      return ApiResponse.success<Schedule>({
        ...response,
        data,
      })
    } catch (err) {
      return ApiResponse.error<Schedule>(err)
    }
  }

  async createSchedule(payload: CreateSchedulePayload): Promise<ApiResponse<Schedule>> {
    try {
      const response: AxiosResponse = await protectedApi.post('/schedules', payload)
      const data: Schedule = response.data?.data || response.data
      return ApiResponse.success<Schedule>({
        ...response,
        data,
      })
    } catch (err) {
      return ApiResponse.error<Schedule>(err)
    }
  }

  async updateSchedule(
    id: number | string,
    payload: UpdateSchedulePayload,
  ): Promise<ApiResponse<Schedule>> {
    try {
      const response: AxiosResponse = await protectedApi.patch(`/schedules/${id}`, payload)
      const data: Schedule = response.data?.data || response.data
      return ApiResponse.success<Schedule>({
        ...response,
        data,
      })
    } catch (err) {
      return ApiResponse.error<Schedule>(err)
    }
  }

  async deleteSchedule(id: number | string): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse = await protectedApi.delete(`/schedules/${id}`)
      return ApiResponse.success<void>(response)
    } catch (err) {
      return ApiResponse.error<void>(err)
    }
  }
}

const scheduleService = new ScheduleService()
export default scheduleService
