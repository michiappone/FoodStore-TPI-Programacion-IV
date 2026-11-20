import { useMemo, useState } from 'react'
import { getCoreRowModel, getPaginationRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { useAuthStore } from '@/store/authStore'
import { EntityTable } from '@/shared/ui/EntityTable'
import { Button } from '@/shared/ui/Button'
import { EstadoError } from '@/shared/components/EstadoError'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { handleApiError } from '@/shared/api/handleApiError'
import type {Usuario} from '@/features/auth/types/Usuario'
import { useUsuarios } from '../hooks/useUsuarios'

const empty: Usuario[] = []
export function AdminUsuariosPage() {
  const current = useAuthStore(s => s.usuario)
  const {query, activar, desactivar} = useUsuarios()
  const [error,setError] = useState('')
  async function cambiar(user: Usuario) {
    try {setError(''); if (user.disabled) await activar.mutateAsync(user.id)
      else if (window.confirm(`¿Desactivar al usuario "${user.username}"?`)) await desactivar.mutateAsync(user.id)
    } catch (exc) {setError(handleApiError(exc))}
  }
  const columns = useMemo<ColumnDef<Usuario>[]>(() => [
    {accessorKey: 'username',header: 'Usuario'},
    {accessorKey: 'full_name',header: 'Nombre'},
    {accessorKey: 'email',header: 'Email'},
    {accessorKey: 'role',header: 'Rol'},
    {id: 'estado',header: 'Estado',cell: ({row}) => row.original.disabled ? 'Desactivado' : 'Activo'},
    {id: 'acciones',header: 'Acciones',cell: ({row}) => row.original.id === current?.id && !row.original.disabled ? <span className="text-xs text-slate-400">Tu cuenta</span> : <Button variant={row.original.disabled ? 'soft' : 'danger'} onClick={() => void cambiar(row.original)}>{row.original.disabled ? 'Activar' : 'Desactivar'}</Button>},
  ], [current?.id])
  const table = useReactTable({data: query.data ?? empty,columns,getCoreRowModel:getCoreRowModel(),getPaginationRowModel:getPaginationRowModel(),initialState:{pagination:{pageIndex:0,pageSize:10}}})
  return <section className="space-y-5"><div><h1 className="section-title">Usuarios</h1><p className="text-sm text-slate-500">Administrar el estado de los usuarios registrados</p></div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {query.isPending ? <Skeleton/> : query.isError ? <EstadoError error={query.error} retry={() => void query.refetch()}/> : !query.data.length ? <EstadoVacio mensaje="No hay usuarios"/> : <EntityTable table={table}/>}
  </section>
}
