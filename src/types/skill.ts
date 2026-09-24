export interface Skill {
  id: number
  name: string
  description?: string | null
  organizationId?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateSkillDto {
  name: string
  description: string
}

export interface UpdateSkillDto {
  name?: string
  description?: string
}
