import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriasApi } from '../api/categorias'
import type { CategoriaInput } from '../types/Categoria'

export function useCategorias() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.listar })
  const actualizarCache = () => { void queryClient.invalidateQueries({queryKey: ['categorias']}); void queryClient.invalidateQueries({queryKey: ['productos']}) }
  const crear = useMutation({mutationFn: categoriasApi.crear, onSuccess: actualizarCache})
  const actualizar = useMutation({mutationFn: ({id, data}: {id: number; data: CategoriaInput}) => categoriasApi.actualizar(id, data), onSuccess: actualizarCache})
  const eliminar = useMutation({mutationFn: categoriasApi.eliminar, onSuccess: actualizarCache})
  return {query, crear, actualizar, eliminar}
}
