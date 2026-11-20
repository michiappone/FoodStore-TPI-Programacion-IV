import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pedidosApi } from '../api/pedidos'
import type {PedidoCreate,EstadoPedido} from '../types/Pedido'

function useInvalidarPedidos() {
  const qc = useQueryClient()
  return () => {
    void qc.invalidateQueries({queryKey: ['pedidos']})
    void qc.invalidateQueries({queryKey: ['productos']})
    void qc.invalidateQueries({queryKey: ['resumen']})
  }
}
export function usePedidos(skip = 0, limit = 20, estado?: EstadoPedido) {
  return useQuery({queryKey: ['pedidos',{skip,limit,estado}],queryFn: () => pedidosApi.listar({skip,limit,estado})})
}
export function useCrearPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({mutationFn: (data: PedidoCreate) => pedidosApi.crear(data),onSuccess: invalidar})
}
export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({mutationFn: (id: number) => pedidosApi.cancelar(id),onSuccess: invalidar})
}
export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({mutationFn: ({id,estado}: {id: number;estado: EstadoPedido}) => pedidosApi.estado(id,estado),onSuccess: invalidar})
}
export function useResumenPedidos() {
  return useQuery({queryKey: ['resumen'],queryFn: pedidosApi.resumen})
}
