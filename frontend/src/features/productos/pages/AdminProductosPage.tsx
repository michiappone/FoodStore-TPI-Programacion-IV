import { useMemo, useState } from 'react'
import { getCoreRowModel, getPaginationRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { EntityTable } from '@/shared/ui/EntityTable'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { handleApiError } from '@/shared/api/handleApiError'
import { useProductos } from '../hooks/useProductos'
import { ProductoForm } from '../components/ProductoForm'
import { ProductoStockForm } from '../components/ProductoStockForm'
import type { Producto, ProductoInput } from '../types/Producto'

const empty: Producto[] = []
export function AdminProductosPage() {
  const categorias = useCategorias().query
  const {query,crear,actualizar,eliminar,cambiarStock} = useProductos({skip: 0,limit: 100})
  const [current,setCurrent] = useState<Producto | null>(null)
  const [modal,setModal] = useState<'edit' | 'stock' | null>(null)
  const [error,setError] = useState('')
  async function guardar(data: ProductoInput) {
    if (current) await actualizar.mutateAsync({id: current.id,data})
    else await crear.mutateAsync(data)
    setModal(null)
  }
  async function stock(stock: number, disponible: boolean) {
    if (!current) return
    await cambiarStock.mutateAsync({id: current.id,stock,disponible})
    setModal(null)
  }
  async function borrar(prod: Producto) {
    if (!window.confirm(`¿Dar de baja el producto "${prod.nombre}"?`)) return
    try {setError('');await eliminar.mutateAsync(prod.id)} catch (exc) {setError(handleApiError(exc))}
  }
  const columns = useMemo<ColumnDef<Producto>[]>(() => [
    {accessorKey: 'nombre', header: 'Producto'},
    {id: 'categoria', header: 'Categoría', cell: ({row}) => row.original.categoria.nombre},
    {accessorKey: 'precio_base', header: 'Precio', cell: ({row}) => `$${row.original.precio_base.toLocaleString('es-AR')}`},
    {accessorKey: 'stock', header: 'Stock'},
    {accessorKey: 'disponible', header: 'Disponible', cell: ({row}) => row.original.disponible ? 'Sí' : 'No'},
    {id: 'acciones', header: 'Acciones', cell: ({row}) => <div className="flex flex-wrap gap-1"><Button variant="outline" onClick={() => {setCurrent(row.original);setModal('edit')}}>Editar</Button><Button variant="soft" onClick={() => {setCurrent(row.original);setModal('stock')}}>Stock</Button><Button variant="danger" onClick={() => void borrar(row.original)}>Baja</Button></div>},
  ], [])
  const table = useReactTable({data: query.data?.items ?? empty, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: {pagination: {pageIndex: 0,pageSize: 10}}})
  return <section className="space-y-5"><div className="flex items-center justify-between gap-3"><div><h1 className="section-title">Productos</h1><p className="text-sm text-slate-500">Precios, categorías, stock y disponibilidad</p></div><Button disabled={!categorias.data?.length} onClick={() => {setCurrent(null);setModal('edit')}}>+ Nuevo producto</Button></div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {query.isPending ? <Skeleton/> : query.isError ? <EstadoError error={query.error} retry={() => void query.refetch()}/> : !query.data.items.length ? <EstadoVacio mensaje="No hay productos activos"/> : <EntityTable table={table}/>}
    {modal === 'edit' && <Modal title={current ? 'Editar producto' : 'Nuevo producto'} onClose={() => setModal(null)}><ProductoForm key={current?.id ?? 'new'} current={current} categorias={categorias.data ?? []} onSave={guardar} onClose={() => setModal(null)}/></Modal>}
    {modal === 'stock' && current && <Modal title={`Stock · ${current.nombre}`} onClose={() => setModal(null)}><ProductoStockForm key={current.id} producto={current} guardar={stock} cerrar={() => setModal(null)}/></Modal>}
  </section>
}
