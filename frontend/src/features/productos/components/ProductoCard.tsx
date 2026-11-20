import type { Producto } from '../types/Producto'
import { Button } from '@/shared/ui/Button'
import { useCartStore } from '@/store/cartStore'

export function ProductoCard({producto}: {producto: Producto}) {
  const agregar = useCartStore(s => s.agregar)
  const items = useCartStore(s => s.items)
  const enCarrito = items.find(x => x.producto_id === producto.id)?.cantidad ?? 0
  const agotado = !producto.disponible || producto.stock <= enCarrito
  return <article className="panel group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
    <div className="flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 to-amber-50">
      {producto.imagen_url ? <img src={producto.imagen_url} alt={producto.nombre} loading="lazy" className="h-full w-full object-cover"/> : <span aria-hidden="true" className="text-6xl">🍽️</span>}
    </div>
    <div className="space-y-3 p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold">{producto.nombre}</h3><span className="text-xs text-slate-400">{producto.categoria.nombre}</span></div>
      <p className="min-h-10 text-sm text-slate-500">{producto.descripcion || 'Preparado para vos'}</p>
      <div className="flex items-center justify-between gap-2"><span className="text-xl font-black text-brand">${producto.precio_base.toLocaleString('es-AR')}</span><span className="text-xs text-slate-500">{producto.stock} en stock</span></div>
      <Button disabled={agotado} className="w-full" onClick={() => agregar(producto)}>{agotado ? 'Sin disponibilidad' : '+ Agregar al carrito'}</Button>
    </div>
  </article>
}
