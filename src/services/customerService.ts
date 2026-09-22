import ApiResponse from '../api/ApiResponse'
import { protectedApi } from '../api/axios'
import type { AxiosResponse } from 'axios'
import type {
  CreateAddressDto,
  CreateCustomerDto,
  Customer,
  CustomerAddressRes,
  CustomerHistoryRes,
  GetCustomersQueryParams,
  PaginatedCustomersResponse,
  UpdateAddressDto,
  UpdateCustomerDto,
} from '../types/customer'

class CustomerService {
  async addCustomer(payload: CreateCustomerDto): Promise<ApiResponse<Customer>> {
    try {
      const response: AxiosResponse = await protectedApi.post('/customers', payload)
      return ApiResponse.success<Customer>(response)
    } catch (err) {
      return ApiResponse.error<Customer>(err)
    }
  }

  async getCustomers(
    params?: GetCustomersQueryParams,
  ): Promise<ApiResponse<PaginatedCustomersResponse>> {
    try {
      const response: AxiosResponse = await protectedApi.get('/customers', { params })
      return ApiResponse.success<PaginatedCustomersResponse>(response)
    } catch (err) {
      return ApiResponse.error<PaginatedCustomersResponse>(err)
    }
  }

  async getCustomerById(id: number | string): Promise<ApiResponse<Customer>> {
    try {
      const response: AxiosResponse = await protectedApi.get(`/customers/${id}`)
      return ApiResponse.success<Customer>(response)
    } catch (err) {
      return ApiResponse.error<Customer>(err)
    }
  }

  async updateCustomer(
    id: number | string,
    payload: UpdateCustomerDto,
  ): Promise<ApiResponse<Customer>> {
    try {
      const response: AxiosResponse = await protectedApi.patch(`/customers/${id}`, payload)
      return ApiResponse.success<Customer>(response)
    } catch (err) {
      return ApiResponse.error<Customer>(err)
    }
  }

  async deleteCustomer(id: number | string): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse = await protectedApi.delete(`/customers/${id}`)
      return ApiResponse.success<void>(response)
    } catch (err) {
      return ApiResponse.error<void>(err)
    }
  }

  async getCustomerAddresses(
    customerId: number | string,
  ): Promise<ApiResponse<CustomerAddressRes[] | { data: CustomerAddressRes[] }>> {
    try {
      const response: AxiosResponse = await protectedApi.get(`/customers/${customerId}/addresses`)
      return ApiResponse.success<CustomerAddressRes[] | { data: CustomerAddressRes[] }>(response)
    } catch (err) {
      return ApiResponse.error<CustomerAddressRes[] | { data: CustomerAddressRes[] }>(err)
    }
  }

  async addCustomerAddress(
    customerId: number | string,
    payload: CreateAddressDto,
  ): Promise<ApiResponse<CustomerAddressRes>> {
    try {
      const response: AxiosResponse = await protectedApi.post(
        `/customers/${customerId}/addresses`,
        payload,
      )
      return ApiResponse.success<CustomerAddressRes>(response)
    } catch (err) {
      return ApiResponse.error<CustomerAddressRes>(err)
    }
  }

  async updateCustomerAddress(
    addressId: number | string,
    payload: UpdateAddressDto,
  ): Promise<ApiResponse<CustomerAddressRes>> {
    try {
      const response: AxiosResponse = await protectedApi.patch(
        `/customers/addresses/${addressId}`,
        payload,
      )
      return ApiResponse.success<CustomerAddressRes>(response)
    } catch (err) {
      return ApiResponse.error<CustomerAddressRes>(err)
    }
  }

  async deleteCustomerAddress(
    addressId: number | string,
  ): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse = await protectedApi.delete(
        `/customers/addresses/${addressId}`,
      )
      return ApiResponse.success<void>(response)
    } catch (err) {
      return ApiResponse.error<void>(err)
    }
  }

  async getCustomerHistory(
    customerId: number | string,
  ): Promise<ApiResponse<CustomerHistoryRes[] | { data: CustomerHistoryRes[] }>> {
    try {
      const response: AxiosResponse = await protectedApi.get(
        `/customers/${customerId}/history`,
      )
      return ApiResponse.success<CustomerHistoryRes[] | { data: CustomerHistoryRes[] }>(response)
    } catch (err) {
      return ApiResponse.error<CustomerHistoryRes[] | { data: CustomerHistoryRes[] }>(err)
    }
  }
}

export default new CustomerService()
