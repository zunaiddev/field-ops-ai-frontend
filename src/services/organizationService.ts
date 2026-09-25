import ApiResponse from '../api/ApiResponse'
import { protectedApi } from '../api/axios'
import type { AxiosResponse } from 'axios'
import type { OrganizationRes, UpdateOrganizationDto } from '../types/organization'

class OrganizationService {
  /**
   * Update Current Organization
   * PATCH /organizations/current
   * Required Roles: ORG_OWNER or ORG_ADMIN
   */
  async updateCurrentOrganization(
    payload: UpdateOrganizationDto,
  ): Promise<ApiResponse<OrganizationRes>> {
    try {
      const response: AxiosResponse<OrganizationRes> = await protectedApi.patch(
        '/organizations/current',
        payload,
      )
      return ApiResponse.success<OrganizationRes>(response)
    } catch (err) {
      return ApiResponse.error<OrganizationRes>(err)
    }
  }
}

export const organizationService = new OrganizationService()
export default organizationService
