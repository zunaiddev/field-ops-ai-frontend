import {protectedApi, publicApi} from '../api/axios'
import {ApiResponse} from '../api/ApiResponse'
import type {
  EmployeeProfileResponse,
  ForgotPasswordResponse,
  LoginFormValues,
  LoginPayload,
  LoginResponse,
  OrganizationRegistrationPayload,
  RefreshTokenResponse,
  RegisterResponse,
  ResendEmailResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  VerifyEmailResponse,
  VerifyResetTokenResponse,
} from '../types/auth'

class AuthService {
  async orgRegistration(payload: OrganizationRegistrationPayload): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await publicApi.post<RegisterResponse>('/auth/register', payload)
      return ApiResponse.success<RegisterResponse>(response)
    } catch (error) {
      return ApiResponse.error<RegisterResponse>(error)
    }
  }

  async employeeLogin(credentials: LoginFormValues): Promise<ApiResponse<LoginResponse>> {
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

  async customerLogin(credentials: LoginFormValues): Promise<ApiResponse<LoginResponse>> {
    try {
      const payload: LoginPayload = {
        email: credentials.email,
        password: credentials.password,
        remember: credentials.rememberMe,
      }

      const response = await publicApi.post<LoginResponse>('/auth/login/customer', payload)

      return ApiResponse.success<LoginResponse>(response)
    } catch (error) {
      return ApiResponse.error<LoginResponse>(error)
    }
  }

  // Alias for backward compatibility
  async orgLogin(credentials: LoginFormValues): Promise<ApiResponse<LoginResponse>> {
    return this.employeeLogin(credentials)
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
      })

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

  /**
   * Request password reset link (Forgot Password).
   * - Employee/General: POST /auth/forgot-password?email=...
   * - Customer: POST /auth/forgot-password/customer?email=...
   */
  async forgotPassword(
    email: string,
    isCustomer: boolean = false,
  ): Promise<ApiResponse<ForgotPasswordResponse>> {
    try {
      const endpoint = isCustomer ? '/auth/forgot-password/customer' : '/auth/forgot-password'
      const response = await publicApi.post<ForgotPasswordResponse>(
        endpoint,
        { email },
        {
          params: { email },
        },
      )
      return ApiResponse.success<ForgotPasswordResponse>(response)
    } catch (error) {
      return ApiResponse.error<ForgotPasswordResponse>(error)
    }
  }

  /**
   * Verify password reset token on page mount.
   * GET /verify/reset-password?token=...
   */
  async verifyResetPasswordToken(
    token: string,
  ): Promise<ApiResponse<VerifyResetTokenResponse>> {
    try {
      const response = await publicApi.get<VerifyResetTokenResponse>(
        '/verify/reset-password',
        {
          params: { token },
        },
      )
      return ApiResponse.success<VerifyResetTokenResponse>(response)
    } catch (error) {
      return ApiResponse.error<VerifyResetTokenResponse>(error)
    }
  }

  /**
   * Submit new password to reset account password.
   * POST /verify/reset-password { token, password }
   */
  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<ApiResponse<ResetPasswordResponse>> {
    try {
      const response = await publicApi.post<ResetPasswordResponse>(
        '/verify/reset-password',
        {
          token: payload.token,
          password: payload.password || payload.newPassword || '',
        },
      )
      return ApiResponse.success<ResetPasswordResponse>(response)
    } catch (error) {
      return ApiResponse.error<ResetPasswordResponse>(error)
    }
  }

  /**
   * Verify email from signup verification link.
   * GET /verify/email?token=...
   */
  async verifyEmail(token: string): Promise<ApiResponse<VerifyEmailResponse>> {
    try {
      const response = await publicApi.get<VerifyEmailResponse>('/verify/email', {
        params: { token },
      })
      return ApiResponse.success<VerifyEmailResponse>(response)
    } catch (error) {
      return ApiResponse.error<VerifyEmailResponse>(error)
    }
  }
}

export default new AuthService()
