import { api } from '@/shared/api/axiosInstance'
import type { Categoria, CategoriaInput } from '../types/Categoria'
export const categoriasApi = {
  async listar(): Promise<Categoria[]> { return (await api.get<Categoria[]>('/categorias')).data },
  async crear(data: CategoriaInput): Promise<Categoria> { return (await api.post<Categoria>('/categorias', data)).data },
  async actualizar(id: number, data: CategoriaInput): Promise<Categoria> { return (await api.put<Categoria>(`/categorias/${id}`, data)).data },
  async eliminar(id: number): Promise<void> { await api.delete(`/categorias/${id}`) },
}
