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

export interface LoginPayload {
  email: string
  password: string
  remember: boolean
}

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>

export interface RegisterResponse {
  email: string
  firstName: string
  lastName: string
  organizationId: string
}

export interface LoginResponse {
  id: string
  email: string
  accessToken: string
}

export type RefreshTokenResponse = LoginResponse

export interface ResendVerificationPayload {
  email: string
}

export interface ResendEmailResponse {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  token?: string
  newPassword?: string
}

export interface RefreshTokenPayload {
  refreshToken?: string
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role?: string
}

export interface AuthOrganization {
  id: string
  name: string
  slug: string
  timezone?: string
  currency?: string
}

export interface AuthResponse {
  token: string
  refreshToken?: string
  user?: AuthUser
  organization?: AuthOrganization
}
