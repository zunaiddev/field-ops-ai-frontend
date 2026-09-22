import {protectedApi, publicApi} from '../api/axios'
import {ApiResponse} from '../api/ApiResponse'
import type {
  EmployeeProfileResponse,
  LoginFormValues,
  LoginPayload,
  LoginResponse,
  OrganizationRegistrationPayload,
  RefreshTokenResponse,
  RegisterResponse,
  ResendEmailResponse,
  ResetPasswordPayload,
} from '../types/auth';

class AuthService {
  async orgRegistration(payload: OrganizationRegistrationPayload): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await publicApi.post<RegisterResponse>('/auth/register', payload)
      return ApiResponse.success<RegisterResponse>(response)
    } catch (error) {
      return ApiResponse.error<RegisterResponse>(error)
    }
  }

  async orgLogin(credentials: LoginFormValues): Promise<ApiResponse<LoginResponse>> {
    try {
      const payload: LoginPayload = {
        email: credentials.email,
        password: credentials.password,
        remember: credentials.rememberMe,
      }

      const response = await publicApi.post<LoginResponse>('/auth/login', payload)

      return ApiResponse.success<LoginResponse>(response)
    } catch (error) {
      return ApiResponse.error<LoginResponse>(error)
    }
  }

  async getEmployeeProfile(): Promise<ApiResponse<EmployeeProfileResponse>> {
    try {
      const response = await protectedApi.get<EmployeeProfileResponse>('/employees')
      return ApiResponse.success<EmployeeProfileResponse>(response)
    } catch (error) {
      return ApiResponse.error<EmployeeProfileResponse>(error)
    }
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse<ResendEmailResponse>> {
    try {
      const response = await publicApi.get<ResendEmailResponse>('/auth/resend-email', {
        params: { email },
      });

      return ApiResponse.success<ResendEmailResponse>(response)
    } catch (error) {
      return ApiResponse.error<ResendEmailResponse>(error)
    }
  }

  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    try {
      const response = await publicApi.get<RefreshTokenResponse>('/auth/refresh-token')

      return ApiResponse.success<RefreshTokenResponse>(response)
    } catch (error) {
      return ApiResponse.error<RefreshTokenResponse>(error)
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await publicApi.get<void>('/auth/logout')
      return ApiResponse.success<void>(response)
    } catch (error) {
      return ApiResponse.error<void>(error)
    }
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const response = await protectedApi.post<{ success: boolean; message: string }>(
          '/auth/password/reset',
          payload,
      )
      return ApiResponse.success<{ success: boolean; message: string }>(response)
    } catch (error) {
      return ApiResponse.error<{ success: boolean; message: string }>(error)
    }
  }
}

export default new AuthService();
