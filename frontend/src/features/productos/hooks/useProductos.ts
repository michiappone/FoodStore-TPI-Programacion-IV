import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productosApi } from '../api/productos'
import type { FiltrosProductos, ProductoInput } from '../types/Producto'

export function useProductos(filtros: FiltrosProductos) {
  const qc = useQueryClient()
  const query = useQuery({ queryKey: ['productos', filtros], queryFn: () => productosApi.listar(filtros) })
  const invalidar = () => {void qc.invalidateQueries({queryKey: ['productos']}); void qc.invalidateQueries({queryKey: ['pedidos']}); void qc.invalidateQueries({queryKey: ['resumen']})}
  const crear = useMutation({mutationFn: productosApi.crear, onSuccess: invalidar})
  const actualizar = useMutation({mutationFn: ({id, data}: {id: number; data: ProductoInput}) => productosApi.actualizar(id,data), onSuccess: invalidar})
  const eliminar = useMutation({mutationFn: productosApi.eliminar, onSuccess: invalidar})
  const cambiarStock = useMutation({mutationFn: ({id,stock,disponible}: {id: number;stock: number;disponible: boolean}) => productosApi.stock(id,stock,disponible),onSuccess: invalidar})
  return {query,crear,actualizar,eliminar,cambiarStock}
}
