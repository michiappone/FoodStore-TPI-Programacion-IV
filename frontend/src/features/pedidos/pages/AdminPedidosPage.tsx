import { useMemo, useState } from 'react'
import { getCoreRowModel, getPaginationRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { EntityTable } from '@/shared/ui/EntityTable'
import { Button } from '@/shared/ui/Button'
import { EstadoError } from '@/shared/components/EstadoError'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { handleApiError } from '@/shared/api/handleApiError'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { BadgeEstado } from '../components/BadgeEstado'
import { DetallePedido } from '../components/DetallePedido'
import type {Pedido,EstadoPedido} from '../types/Pedido'

const limit = 20
const empty: Pedido[] = []
export function AdminPedidosPage() {
  const [page,setPage] = useState(0)
  const [estado,setEstado] = useState<EstadoPedido | ''>('')
  const [error,setError] = useState('')
  const [seleccionado,setSeleccionado] = useState<Pedido | null>(null)
  const query = usePedidos(page * limit,limit,estado || undefined)
  const cambiar = useCambiarEstadoPedido()
  async function change(id: number, siguiente: EstadoPedido) {
    try {setError('');await cambiar.mutateAsync({id,estado:siguiente})}
    catch (exc) {setError(handleApiError(exc))}
  }
  const columns = useMemo<ColumnDef<Pedido>[]>(() => [
    {accessorKey: 'id', header: 'Pedido'},
    {accessorKey: 'usuario_id', header: 'Usuario ID'},
    {accessorKey: 'total', header: 'Total', cell: ({row}) => `$${row.original.total.toLocaleString('es-AR')}`},
    {accessorKey: 'estado', header: 'Estado', cell: ({row}) => <BadgeEstado estado={row.original.estado}/>},
    {id: 'acciones', header: 'Acciones', cell: ({row}) => <div className="flex flex-wrap gap-1"><Button variant="outline" onClick={() => setSeleccionado(row.original)}>Detalle</Button>{row.original.estado === 'PENDIENTE' && <Button onClick={() => void change(row.original.id,'EN_PREPARACION')}>Preparar</Button>}{row.original.estado === 'EN_PREPARACION' && <Button onClick={() => void change(row.original.id,'ENTREGADO')}>Entregar</Button>}{(row.original.estado === 'PENDIENTE' || row.original.estado === 'EN_PREPARACION') && <Button variant="danger" onClick={() => void change(row.original.id,'CANCELADO')}>Cancelar</Button>}</div>},
  ], [])
  const table = useReactTable({data: query.data?.items ?? empty, columns, getCoreRowModel: getCoreRowModel(),getPaginationRowModel: getPaginationRowModel(), initialState: {pagination: {pageIndex: 0,pageSize: 20}}})
  return <section className="space-y-5"><div><h1 className="section-title">Gestión de pedidos</h1><p className="text-sm text-slate-500">Estados y cancelaciones con restitución de stock</p></div>
    <div className="max-w-xs"><label className="field-label">Filtrar por estado</label><select className="field-input" value={estado} onChange={e => {setEstado(e.target.value as EstadoPedido | '');setPage(0)}}><option value="">Todos los estados</option>{(['PENDIENTE','EN_PREPARACION','ENTREGADO','CANCELADO'] as EstadoPedido[]).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {query.isPending ? <Skeleton/> : query.isError ? <EstadoError error={query.error} retry={() => void query.refetch()}/> : !query.data.total ? <EstadoVacio mensaje="No hay pedidos con ese estado"/> : <><EntityTable table={table}/><Paginacion pagina={page} total={query.data.total} limite={limit} onChange={setPage}/></>}
    {seleccionado && <div className="panel p-5"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Detalle del pedido</h2><Button variant="outline" onClick={() => setSeleccionado(null)}>Cerrar</Button></div><DetallePedido pedido={seleccionado}/></div>}
  </section>
}
