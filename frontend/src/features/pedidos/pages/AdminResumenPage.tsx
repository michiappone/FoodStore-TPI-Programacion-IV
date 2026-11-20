import { useResumenPedidos } from '../hooks/usePedidos'
import { EstadoError } from '@/shared/components/EstadoError'
import { Skeleton } from '@/shared/components/Skeleton'
export function AdminResumenPage() {
  const query = useResumenPedidos()
  if (query.isPending) return <Skeleton/>
  if (query.isError) return <EstadoError error={query.error} retry={() => void query.refetch()}/>
  const {pendientes,en_preparacion,entregados,cancelados,pedidos_hoy,ingresos_entregados} = query.data
  const cards = [
    ['Pendientes',pendientes,'🕒'],['En preparación',en_preparacion,'👩‍🍳'],
    ['Entregados',entregados,'✅'],['Cancelados',cancelados,'❌'],
    ['Pedidos de hoy',pedidos_hoy,'📅'],['Ingresos entregados',`$${ingresos_entregados.toLocaleString('es-AR')}`,'💰'],
  ] as const
  return <section><h1 className="section-title">Resumen del negocio</h1><p className="mb-6 mt-2 text-sm text-slate-500">Indicadores de pedidos e ingresos de pedidos entregados.</p>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([name,value,emoji]) => <div className="panel p-7" key={name}><div className="text-3xl">{emoji}</div><p className="mt-4 text-sm font-semibold text-slate-500">{name}</p><p className="mt-2 text-3xl font-black text-brand">{value}</p></div>)}</div>
  </section>
}
