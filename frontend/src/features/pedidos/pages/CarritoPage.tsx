import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/shared/ui/Button'
import { EstadoVacio } from '@/shared/components/EstadoVacio'

export function CarritoPage() {
  const {items, quitar, cambiarCantidad, vaciar, total} = useCartStore()
  return <section className="space-y-5"><h1 className="section-title">Tu carrito</h1>
    {!items.length ? <><EstadoVacio mensaje="Todavía no agregaste productos"/><Link to="/" className="inline-block font-semibold text-brand underline">Explorar catálogo</Link></> : <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="panel divide-y divide-slate-100">{items.map(item => <div key={item.producto_id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><strong>{item.nombre}</strong><p className="text-sm text-slate-500">${item.precio_unitario.toLocaleString('es-AR')} por unidad</p></div><div className="flex items-center gap-2"><label className="text-sm" htmlFor={`cantidad-${item.producto_id}`}>Cantidad</label><input id={`cantidad-${item.producto_id}`} className="field-input w-20" type="number" min="1" step="1" value={item.cantidad} onChange={e => cambiarCantidad(item.producto_id,Number(e.target.value))}/><span className="w-25 text-right font-bold">${(item.cantidad * item.precio_unitario).toLocaleString('es-AR')}</span><Button variant="outline" onClick={() => quitar(item.producto_id)}>Quitar</Button></div></div>)}</div>
      <div className="panel h-fit p-6"><p className="text-sm text-slate-500">Total estimado</p><strong className="mt-1 block text-3xl text-brand">${total().toLocaleString('es-AR')}</strong><p className="mt-3 text-xs text-slate-400">El servidor valida el precio y el stock al confirmar.</p><Link className="mt-5 block rounded-xl bg-brand p-3 text-center font-semibold text-white" to="/checkout">Confirmar pedido</Link><Button className="mt-3 w-full" variant="outline" onClick={vaciar}>Vaciar carrito</Button></div>
    </div>}
  </section>
}
