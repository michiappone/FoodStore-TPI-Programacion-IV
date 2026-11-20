import { api } from '@/shared/api/axiosInstance'
import type {Pedido,PedidosPaginados,PedidoCreate,EstadoPedido,ResumenPedidos} from '../types/Pedido'
export const pedidosApi = {
  async listar(params: {skip: number;limit: number;estado?: EstadoPedido}): Promise<PedidosPaginados> {return (await api.get<PedidosPaginados>('/pedidos',{params})).data},
  async obtener(id: number): Promise<Pedido> {return (await api.get<Pedido>(`/pedidos/${id}`)).data},
  async crear(data: PedidoCreate): Promise<Pedido> {return (await api.post<Pedido>('/pedidos',data)).data},
  async cancelar(id: number): Promise<Pedido> {return (await api.patch<Pedido>(`/pedidos/${id}/cancelar`)).data},
  async estado(id: number, estado: EstadoPedido): Promise<Pedido> {return (await api.patch<Pedido>(`/pedidos/${id}/estado`,{estado})).data},
  async resumen(): Promise<ResumenPedidos> {return (await api.get<ResumenPedidos>('/pedidos/resumen')).data},
}
