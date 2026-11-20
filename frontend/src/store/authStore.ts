import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/features/auth/api/auth'
import type { Usuario } from '@/features/auth/types/Usuario'

type AuthState = {
  usuario: Usuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

// Persistir solo los datos visibles del usuario. Nunca guardar el JWT.
export const useAuthStore = create<AuthState>()(persist((set) => ({
  usuario: null,
  cargando: true,
  login: async (username, password) => {
    await authApi.login(username, password)
    set({ usuario: await authApi.me(), cargando: false })
  },
  logout: async () => {
    try { await authApi.logout() }
    finally { set({ usuario: null, cargando: false }) }
  },
  checkSession: async () => {
    set({ cargando: true })
    try { set({ usuario: await authApi.me() }) }
    catch { set({ usuario: null }) }
    finally { set({ cargando: false }) }
  },
  limpiarSesion: () => set({ usuario: null, cargando: false }),
}), {
  name: 'foodstore-auth',
  partialize: state => ({ usuario: state.usuario }),
}))
