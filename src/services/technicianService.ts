import ApiResponse from '../api/ApiResponse'
import { protectedApi } from '../api/axios'
import type { AxiosResponse } from 'axios'
import type {
  CreateTechnicianDto,
  Technician,
  TechnicianAddress,
  UpdateTechnicianAddressDto,
  UpdateTechnicianStatusDto,
} from '../types/technician'
import type { Skill } from '../types/skill'

class TechnicianService {
  async getTechnicians(): Promise<ApiResponse<Technician[]>> {
    try {
      const response: AxiosResponse = await protectedApi.get('/technicians')
      let list: Technician[] = []
      if (Array.isArray(response.data)) {
        list = response.data
      } else if (response.data && Array.isArray(response.data.data)) {
        list = response.data.data
      } else if (response.data && Array.isArray(response.data.technicians)) {
        list = response.data.technicians
      } else if (response.data) {
        list = [response.data]
      }
      return ApiResponse.success<Technician[]>({
        ...response,
        data: list,
      })
    } catch (err) {
      return ApiResponse.error<Technician[]>(err)
    }
  }

  async getTechnicianById(id: number | string): Promise<ApiResponse<Technician>> {
    try {
      const response: AxiosResponse = await protectedApi.get(`/technicians/${id}`)
      const data: Technician = response.data?.data || response.data
      return ApiResponse.success<Technician>({
        ...response,
        data,
      })
    } catch (err) {
      return ApiResponse.error<Technician>(err)
    }
  }

  async createTechnician(payload: CreateTechnicianDto): Promise<ApiResponse<Technician>> {
    try {
      const response: AxiosResponse = await protectedApi.post('/technicians', payload)
      const data: Technician = response.data?.data || response.data
      return ApiResponse.success<Technician>({
        ...response,
        data,
      })
    } catch (err) {
      return ApiResponse.error<Technician>(err)
    }
  }

  async updateTechnicianStatus(
    technicianId: number | string,
    payload: UpdateTechnicianStatusDto,
  ): Promise<ApiResponse<Technician>> {
    try {
      const response: AxiosResponse = await protectedApi.patch(
        `/technicians/${technicianId}`,
        payload,
      )
      const data: Technician = response.data?.data || response.data
      return ApiResponse.success<Technician>({
        ...response,
        data,
      })
    } catch (err) {
      return ApiResponse.error<Technician>(err)
    }
  }

  async deleteTechnician(id: number | string): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse = await protectedApi.delete(`/technicians/${id}`)
      return ApiResponse.success<void>(response)
    } catch (err) {
      return ApiResponse.error<void>(err)
    }
  }

  async getTechnicianSkills(
    technicianId: number | string,
  ): Promise<ApiResponse<Skill[]>> {
    try {
      const response: AxiosResponse = await protectedApi.get(
        `/technicians/${technicianId}/skills`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )
      let list: Skill[] = []
      if (Array.isArray(response.data)) {
        list = response.data
      } else if (response.data && Array.isArray(response.data.data)) {
        list = response.data.data
      } else if (response.data && Array.isArray(response.data.skills)) {
        list = response.data.skills
      } else if (response.data) {
        list = [response.data]
      }
      return ApiResponse.success<Skill[]>({
        ...response,
        data: list,
      })
    } catch (err) {
      return ApiResponse.error<Skill[]>(err)
    }
  }

  async assignSkillToTechnician(
    technicianId: number | string,
    skillId: number | string,
  ): Promise<ApiResponse<Skill>> {
    try {
      const response: AxiosResponse = await protectedApi.patch(
        `/technicians/${technicianId}/skills/${skillId}`,
      )
      const data: Skill = response.data?.data || response.data
      return ApiResponse.success<Skill>({
        ...response,
        data,
      })
    } catch (err) {
      return ApiResponse.error<Skill>(err)
    }
  }

  async removeSkillFromTechnician(
    technicianId: number | string,
    skillId: number | string,
  ): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse = await protectedApi.delete(
        `/technicians/${technicianId}/skills/${skillId}`,
      )
      return ApiResponse.success<void>(response)
    } catch (err) {
      return ApiResponse.error<void>(err)
    }
  }

  async updateTechnicianAddress(
    technicianId: number | string,
    addressId: number | string,
    payload: UpdateTechnicianAddressDto,
  ): Promise<ApiResponse<TechnicianAddress>> {
    try {
      const response: AxiosResponse = await protectedApi.patch(
        `/technicians/${technicianId}/address/${addressId}`,
        payload,
      )
      const data: TechnicianAddress = response.data?.data || response.data
      return ApiResponse.success<TechnicianAddress>({
        ...response,
        data,
      })
    } catch (err) {
      return ApiResponse.error<TechnicianAddress>(err)
    }
  }
}

export default new TechnicianService()
