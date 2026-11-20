import type {Pedido} from '../types/Pedido'
export function DetallePedido({pedido}: {pedido: Pedido}) {
  return <div className="rounded-xl bg-slate-50 p-4 text-sm"><p className="font-semibold">Detalle del pedido #{pedido.id}</p><p className="mt-1 text-slate-500">Entrega: {pedido.direccion_entrega} · Pago: {pedido.forma_pago}</p>
    {pedido.notas && <p className="mt-1 text-slate-500">Nota: {pedido.notas}</p>}
    <ul className="mt-3 divide-y divide-slate-200">{pedido.items.map(item => <li key={item.producto_id} className="flex items-center justify-between gap-2 py-2"><span>{item.cantidad} × {item.nombre_producto} <span className="text-slate-500">(${item.precio_unitario.toLocaleString('es-AR')}/u)</span></span><strong>${item.subtotal.toLocaleString('es-AR')}</strong></li>)}</ul>
    <p className="mt-3 text-right font-bold">Total: ${pedido.total.toLocaleString('es-AR')}</p>
  </div>
}
