import { api } from '@/shared/api/axiosInstance'
import type { Producto, ProductoInput, ProductosPaginados, FiltrosProductos } from '../types/Producto'
export const productosApi = {
  async listar(filtros: FiltrosProductos): Promise<ProductosPaginados> { return (await api.get<ProductosPaginados>('/productos', {params: filtros})).data },
  async obtener(id: number): Promise<Producto> { return (await api.get<Producto>(`/productos/${id}`)).data },
  async crear(data: ProductoInput): Promise<Producto> { return (await api.post<Producto>('/productos', data)).data },
  async actualizar(id: number, data: ProductoInput): Promise<Producto> { return (await api.put<Producto>(`/productos/${id}`, data)).data },
  async stock(id: number, stock: number, disponible: boolean): Promise<Producto> { return (await api.patch<Producto>(`/productos/${id}/stock`, {stock, disponible})).data },
  async eliminar(id: number): Promise<void> { await api.delete(`/productos/${id}`) },
}
