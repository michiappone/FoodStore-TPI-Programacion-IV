import { api } from '@/shared/api/axiosInstance'
import type { Registro, Usuario } from '../types/Usuario'

export const authApi = {
  async login(username: string, password: string): Promise<void> {
    const form = new URLSearchParams({ username, password })
    await api.post('/auth/token', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  },
  async registrar(data: Registro): Promise<Usuario> {
    const response = await api.post<Usuario>('/auth/register', data)
    return response.data
  },
  async me(): Promise<Usuario> {
    const response = await api.get<Usuario>('/auth/me')
    return response.data
  },
  async logout(): Promise<void> { await api.post('/auth/logout') },
}
