import type {AxiosError, AxiosResponse} from 'axios'

export interface ApiErrorDetails {
  message: string
  code: string
  errorCode?: string
}

export class ApiResponse<T = unknown> {
  public success: boolean
  public status: number
  public payload: T | null
  public error: ApiErrorDetails | null

  constructor(
    success: boolean,
    status: number,
    payload: T | null = null,
    error: ApiErrorDetails | null
  ) {
    this.success = success
    this.status = status
    this.payload = payload
    this.error = error
  }

  static success<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return new ApiResponse<T>(
      true,
      response.status,
      response.data,
      null,
    );
  }

  static error<T>(err: unknown): ApiResponse<T> {
    let status = 500
    let message = 'An unexpected error occurred'
    let code: string = 'UNKNOWN'
    let errorCode: string | undefined = undefined

    if (typeof err === 'object' && err !== null && 'isAxiosError' in err) {
      const axiosErr = err as AxiosError<Record<string, unknown>>
      status = axiosErr.response?.status ?? (axiosErr.status ? Number(axiosErr.status) : 500)

      const responseData = axiosErr.response?.data
      if (responseData) {
        if (typeof responseData === 'string') {
          message = responseData
        } else if (typeof responseData === 'object') {
          if (Array.isArray(responseData.message)) {
            message = responseData.message.join(', ')
          } else {
            message =
              (responseData.message as string) ||
              (responseData.error as string) ||
              axiosErr.message ||
              'Request failed'
          }
          code = (responseData.code as string) || (responseData.errorCode as string) || 'UNKNOWN'
          errorCode = (responseData.errorCode as string) || (responseData.code as string)
        }
      } else if (axiosErr.message) {
        message = axiosErr.message
      }
    } else if (err instanceof Error) {
      message = err.message
    } else if (typeof err === 'string') {
      message = err
    }

    return new ApiResponse<T>(
      false,
      status,
      null,
      {
        message,
        code,
        errorCode,
      },
    )
  }
}

export default ApiResponse
