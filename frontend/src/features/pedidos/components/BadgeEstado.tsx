import type { EstadoPedido } from '../types/Pedido'
const colors: Record<EstadoPedido,string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_PREPARACION: 'bg-sky-100 text-sky-800',
  ENTREGADO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-red-100 text-red-700',
}
export function BadgeEstado({estado}: {estado: EstadoPedido}) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${colors[estado]}`}>{estado.replace('_',' ')}</span>
}
