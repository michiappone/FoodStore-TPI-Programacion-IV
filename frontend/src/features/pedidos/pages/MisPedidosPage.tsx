import { useState } from 'react'
import { Paginacion } from '@/shared/components/Paginacion'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Skeleton } from '@/shared/components/Skeleton'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { BadgeEstado } from '../components/BadgeEstado'
import { DetallePedido } from '../components/DetallePedido'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'

const limit = 10
export function MisPedidosPage() {
  const [page,setPage] = useState(0)
  const [abierto,setAbierto] = useState<number | null>(null)
  const [error,setError] = useState('')
  const query = usePedidos(page * limit,limit)
  const cancelar = useCancelarPedido()
  async function cancelarPedido(id: number) {
    if (!window.confirm(`¿Cancelar el pedido #${id}? El stock se devolverá.`)) return
    try {setError('');await cancelar.mutateAsync(id)} catch (exc) {setError(handleApiError(exc))}
  }
  return <section className="space-y-5"><h1 className="section-title">Mis pedidos</h1>{error && <p role="alert" className="text-red-700">{error}</p>}
    {query.isPending ? <Skeleton/> : query.isError ? <EstadoError error={query.error} retry={() => void query.refetch()}/> : !query.data.total ? <EstadoVacio mensaje="Todavía no hiciste ningún pedido"/> : <>
      <div className="space-y-4">{query.data.items.map(pedido => <article className="panel p-5" key={pedido.id}><div className="flex flex-wrap items-center justify-between gap-3"><div><strong>Pedido #{pedido.id}</strong><p className="text-sm text-slate-500">{new Date(pedido.created_at).toLocaleString('es-AR')} · ${pedido.total.toLocaleString('es-AR')}</p></div><div className="flex flex-wrap items-center gap-2"><BadgeEstado estado={pedido.estado}/><Button variant="outline" onClick={() => setAbierto(abierto === pedido.id ? null : pedido.id)}>{abierto === pedido.id ? 'Ocultar detalle' : 'Ver detalle'}</Button>{pedido.estado === 'PENDIENTE' && <Button variant="danger" disabled={cancelar.isPending} onClick={() => void cancelarPedido(pedido.id)}>Cancelar</Button>}</div></div>{abierto === pedido.id && <div className="mt-4"><DetallePedido pedido={pedido}/></div>}</article>)}</div>
      <Paginacion pagina={page} total={query.data.total} limite={limit} onChange={setPage}/>
    </>}
  </section>
}
