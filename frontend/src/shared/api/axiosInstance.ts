import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
  timeout: 15000,
})

api.interceptors.response.use(
  response => response,
  error => {
    const status: number | undefined = axios.isAxiosError(error) ? error.response?.status : undefined
    const url: string = axios.isAxiosError(error) ? error.config?.url ?? '' : ''
    const detail: unknown = axios.isAxiosError(error) ? error.response?.data?.detail : undefined
    if ((status === 401 && !url.includes('/auth/token') && !url.includes('/auth/me')) ||
        (status === 400 && detail === 'Cuenta de usuario desactivada')) {
      useAuthStore.getState().limpiarSesion()
    }
    return Promise.reject(error)
  },
)
