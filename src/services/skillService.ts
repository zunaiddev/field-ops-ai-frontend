import ApiResponse from '../api/ApiResponse'
import { protectedApi } from '../api/axios'
import type { AxiosResponse } from 'axios'
import type { CreateSkillDto, Skill, UpdateSkillDto } from '../types/skill'

class SkillService {
  async getSkills(): Promise<ApiResponse<Skill[]>> {
    try {
      const response: AxiosResponse = await protectedApi.get('/technicians/skills')
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

  async getSkillById(id: number | string): Promise<ApiResponse<Skill>> {
    try {
      const response: AxiosResponse = await protectedApi.get(`/technicians/skills/${id}`)
      const data: Skill = response.data?.data || response.data
      return ApiResponse.success<Skill>({
        ...response,
        data,
      })
    } catch (err) {
      return ApiResponse.error<Skill>(err)
    }
  }

  async createSkill(payload: CreateSkillDto): Promise<ApiResponse<Skill>> {
    try {
      const response: AxiosResponse = await protectedApi.post('/technicians/skills', payload)
      const data: Skill = response.data?.data || response.data
      return ApiResponse.success<Skill>({
        ...response,
        data,
      })
    } catch (err) {
      return ApiResponse.error<Skill>(err)
    }
  }

  async updateSkill(
    id: number | string,
    payload: UpdateSkillDto,
  ): Promise<ApiResponse<Skill>> {
    try {
      const response: AxiosResponse = await protectedApi.patch(
        `/technicians/skills/${id}`,
        payload,
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

  async deleteSkill(id: number | string): Promise<ApiResponse<void>> {
    try {
      let response: AxiosResponse
      try {
        // Spec endpoint: DELETE /technicians/skill/:id
        response = await protectedApi.delete(`/technicians/skill/${id}`)
      } catch (err: unknown) {
        // If /technicians/skill/:id returns 404, fallback to /technicians/skills/:id
        const is404 =
          typeof err === 'object' &&
          err !== null &&
          'response' in err &&
          (err as { response?: { status?: number } }).response?.status === 404
        if (is404) {
          response = await protectedApi.delete(`/technicians/skills/${id}`)
        } else {
          throw err
        }
      }
      return ApiResponse.success<void>(response)
    } catch (err) {
      return ApiResponse.error<void>(err)
    }
  }
}

export default new SkillService()
