import axios, {type AxiosError, type AxiosInstance, HttpStatusCode, type InternalAxiosRequestConfig,} from 'axios'
import toast from "react-hot-toast";
import authService from "../services/authService.ts";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const publicApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
})

export const protectedApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
})

protectedApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token: string | null = localStorage.getItem('token');

    if (!token) {
      const {success, payload} = await authService.refreshToken();

      if (success) {
        token = payload?.accessToken as string;
      } else {
        toast.error('Session expired');
        window.location.href = '/auth/login';
        return Promise.reject("No access token");
      }
    }

    config.headers.Authorization = `Bearer ${token}`

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

protectedApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === HttpStatusCode.Unauthorized) {
      localStorage.removeItem('token')
      localStorage.removeItem('access_token')
      sessionStorage.removeItem('token')

      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login'
      }
    }

    return Promise.reject(error)
  },
)

export default {
  publicApi,
  protectedApi,
}
