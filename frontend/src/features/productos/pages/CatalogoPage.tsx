import { useState } from 'react'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { Paginacion } from '@/shared/components/Paginacion'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { EstadoError } from '@/shared/components/EstadoError'
import { useProductos } from '../hooks/useProductos'
import { ProductoCard } from '../components/ProductoCard'

const limite = 9
export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('')
  const categorias = useCategorias().query
  const productos = useProductos({skip: pagina * limite, limit: limite, search: search || undefined,
    categoria_id: categoria ? Number(categoria) : undefined}).query
  return <div className="space-y-6"><div className="rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-700 px-8 py-12 text-white">
    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Rico, fresco y al instante</p>
    <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Tu comida favorita<br/>en un solo lugar.</h1>
    <p className="mt-4 max-w-xl text-emerald-100">Elegí, armá tu carrito y hacé tu pedido en unos pasos.</p>
  </div>
  <div className="panel flex flex-wrap gap-4 p-4"><div className="min-w-55 flex-1"><label className="field-label">Buscar productos</label><input className="field-input" placeholder="Ej. pizza, hamburguesa…" value={search} onChange={e => {setSearch(e.target.value);setPagina(0)}}/></div>
    <div className="min-w-48"><label className="field-label">Categoría</label><select className="field-input" value={categoria} onChange={e => {setCategoria(e.target.value);setPagina(0)}}><option value="">Todas</option>{categorias.data?.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
  </div>
  {productos.isPending ? <Skeleton/> : productos.isError ? <EstadoError error={productos.error} retry={() => void productos.refetch()}/> : productos.data.total === 0 ? <EstadoVacio mensaje="No encontramos productos con esos filtros"/> : <><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{productos.data.items.map(p => <ProductoCard key={p.id} producto={p}/>)}</div><Paginacion pagina={pagina} total={productos.data.total} limite={limite} onChange={setPagina}/></>}
</div>
}
