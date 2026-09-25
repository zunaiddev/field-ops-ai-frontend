import ApiResponse from '../api/ApiResponse'
import { protectedApi } from '../api/axios'
import type { AxiosResponse } from 'axios'
import type {
  CreateCustomerAddressDto,
  CreateCustomerServiceRequestDto,
  CustomerAddress,
  CustomerProfile,
  CustomerServiceRequest,
  UpdateCustomerAddressDto,
  UpdateCustomerProfileDto,
  UpdateCustomerServiceRequestDto,
} from '../types/publicCustomer'

class CustomerPortalService {
  /**
   * 1. Get Customer Profile
   * GET /public/customers
   */
  async getProfile(): Promise<ApiResponse<CustomerProfile>> {
    try {
      const response: AxiosResponse<CustomerProfile> = await protectedApi.get('/public/customers')
      return ApiResponse.success<CustomerProfile>(response)
    } catch (err) {
      return ApiResponse.error<CustomerProfile>(err)
    }
  }

  /**
   * 2. Update Customer Profile
   * PATCH /public/customers
   */
  async updateProfile(payload: UpdateCustomerProfileDto): Promise<ApiResponse<CustomerProfile>> {
    try {
      const response: AxiosResponse<CustomerProfile> = await protectedApi.patch(
        '/public/customers',
        payload,
      )
      return ApiResponse.success<CustomerProfile>(response)
    } catch (err) {
      return ApiResponse.error<CustomerProfile>(err)
    }
  }

  /**
   * 3. Get Customer Addresses
   * GET /public/customers/addresses
   */
  async getAddresses(): Promise<ApiResponse<CustomerAddress[]>> {
    try {
      const response: AxiosResponse<CustomerAddress[]> = await protectedApi.get(
        '/public/customers/addresses',
      )
      return ApiResponse.success<CustomerAddress[]>(response)
    } catch (err) {
      return ApiResponse.error<CustomerAddress[]>(err)
    }
  }

  /**
   * 4. Add Customer Address
   * POST /public/customers/addresses
   */
  async addAddress(payload: CreateCustomerAddressDto): Promise<ApiResponse<CustomerAddress>> {
    try {
      const response: AxiosResponse<CustomerAddress> = await protectedApi.post(
        '/public/customers/addresses',
        payload,
      )
      return ApiResponse.success<CustomerAddress>(response)
    } catch (err) {
      return ApiResponse.error<CustomerAddress>(err)
    }
  }

  /**
   * 5. Update Customer Address
   * PATCH /public/customers/addresses/:id
   */
  async updateAddress(
    id: number | string,
    payload: UpdateCustomerAddressDto,
  ): Promise<ApiResponse<CustomerAddress>> {
    try {
      const response: AxiosResponse<CustomerAddress> = await protectedApi.patch(
        `/public/customers/addresses/${id}`,
        payload,
      )
      return ApiResponse.success<CustomerAddress>(response)
    } catch (err) {
      return ApiResponse.error<CustomerAddress>(err)
    }
  }

  /**
   * 6. Delete Customer Address
   * DELETE /public/customers/addresses/:id
   */
  async deleteAddress(id: number | string): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<void> = await protectedApi.delete(
        `/public/customers/addresses/${id}`,
      )
      return ApiResponse.success<void>(response)
    } catch (err) {
      return ApiResponse.error<void>(err)
    }
  }

  /**
   * 7. Get Customer Service Requests
   * GET /public/customers/services
   */
  async getServiceRequests(): Promise<ApiResponse<CustomerServiceRequest[]>> {
    try {
      const response: AxiosResponse<CustomerServiceRequest[]> = await protectedApi.get(
        '/public/customers/services',
      )
      return ApiResponse.success<CustomerServiceRequest[]>(response)
    } catch (err) {
      return ApiResponse.error<CustomerServiceRequest[]>(err)
    }
  }

  /**
   * 8. Create Customer Service Request
   * POST /public/customers/services
   */
  async createServiceRequest(
    payload: CreateCustomerServiceRequestDto,
  ): Promise<ApiResponse<CustomerServiceRequest>> {
    try {
      const requestBody = {
        customerId: payload.customerId ?? 1,
        ...payload,
      }
      const response: AxiosResponse<CustomerServiceRequest> = await protectedApi.post(
        '/public/customers/services',
        requestBody,
      )
      return ApiResponse.success<CustomerServiceRequest>(response)
    } catch (err) {
      return ApiResponse.error<CustomerServiceRequest>(err)
    }
  }

  /**
   * 9. Update Customer Service Request
   * PATCH /public/customers/services/:id
   */
  async updateServiceRequest(
    id: number | string,
    payload: UpdateCustomerServiceRequestDto,
  ): Promise<ApiResponse<CustomerServiceRequest>> {
    try {
      const response: AxiosResponse<CustomerServiceRequest> = await protectedApi.patch(
        `/public/customers/services/${id}`,
        payload,
      )
      return ApiResponse.success<CustomerServiceRequest>(response)
    } catch (err) {
      return ApiResponse.error<CustomerServiceRequest>(err)
    }
  }

  /**
   * 10. Delete Customer Service Request
   * DELETE /public/customers/services/:id
   */
  async deleteServiceRequest(id: number | string): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<void> = await protectedApi.delete(
        `/public/customers/services/${id}`,
      )
      return ApiResponse.success<void>(response)
    } catch (err) {
      return ApiResponse.error<void>(err)
    }
  }
}

export default new CustomerPortalService()
