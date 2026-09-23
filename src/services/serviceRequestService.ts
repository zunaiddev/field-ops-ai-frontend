import ApiResponse from '../api/ApiResponse'
import { protectedApi } from '../api/axios'
import type { AxiosResponse } from 'axios'
import type {
  CreateServiceRequestDto,
  GetServiceRequestsQueryParams,
  PaginatedServiceRequestsResponse,
  ServiceRequest,
  UpdateServiceRequestDto,
} from '../types/serviceRequest'

class ServiceRequestService {
  /**
   * Fetch paginated service requests with optional filters
   */
  async getServiceRequests(
    params?: GetServiceRequestsQueryParams,
  ): Promise<ApiResponse<PaginatedServiceRequestsResponse>> {
    try {
      const response: AxiosResponse = await protectedApi.get('/service-requests', { params })
      return ApiResponse.success<PaginatedServiceRequestsResponse>(response)
    } catch (err) {
      return ApiResponse.error<PaginatedServiceRequestsResponse>(err)
    }
  }

  /**
   * Fetch single service request by ID
   */
  async getServiceRequestById(id: number | string): Promise<ApiResponse<ServiceRequest>> {
    try {
      const response: AxiosResponse = await protectedApi.get(`/service-requests/${id}`)
      return ApiResponse.success<ServiceRequest>(response)
    } catch (err) {
      return ApiResponse.error<ServiceRequest>(err)
    }
  }

  /**
   * Create a new service request
   */
  async createServiceRequest(
    payload: CreateServiceRequestDto,
  ): Promise<ApiResponse<ServiceRequest>> {
    try {
      const response: AxiosResponse = await protectedApi.post('/service-requests', payload)
      return ApiResponse.success<ServiceRequest>(response)
    } catch (err) {
      return ApiResponse.error<ServiceRequest>(err)
    }
  }

  /**
   * Update a service request
   */
  async updateServiceRequest(
    id: number | string,
    payload: UpdateServiceRequestDto,
  ): Promise<ApiResponse<ServiceRequest>> {
    try {
      const response: AxiosResponse = await protectedApi.patch(`/service-requests/${id}`, payload)
      return ApiResponse.success<ServiceRequest>(response)
    } catch (err) {
      return ApiResponse.error<ServiceRequest>(err)
    }
  }

  /**
   * Delete a service request
   */
  async deleteServiceRequest(id: number | string): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse = await protectedApi.delete(`/service-requests/${id}`)
      return ApiResponse.success<void>(response)
    } catch (err) {
      return ApiResponse.error<void>(err)
    }
  }
}

export default new ServiceRequestService()
