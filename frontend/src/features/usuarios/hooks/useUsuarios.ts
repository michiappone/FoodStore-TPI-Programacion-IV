import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usuariosApi } from '../api/usuarios'
export function useUsuarios() {
  const qc = useQueryClient()
  const query = useQuery({queryKey: ['usuarios'],queryFn: usuariosApi.listar})
  const invalidar = () => {void qc.invalidateQueries({queryKey: ['usuarios']})}
  const activar = useMutation({mutationFn: usuariosApi.activar,onSuccess: invalidar})
  const desactivar = useMutation({mutationFn: usuariosApi.desactivar,onSuccess: invalidar})
  return {query,activar,desactivar}
}
