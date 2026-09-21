export interface OrganizationRegistrationPayload {
  orgName: string
  orgSlug?: string
  timezone?: string
  currency?: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface OrganizationRegistrationForm {
  orgName: string
  orgSlug: string
  timezone: string
  currency: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export type FormErrors = Partial<Record<keyof OrganizationRegistrationForm, string>>
export type OrganizationRegistrationFormErrors = FormErrors

export interface LoginFormValues {
  email: string
  password: string
  rememberMe: boolean
}

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>
