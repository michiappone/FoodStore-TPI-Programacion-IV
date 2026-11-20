import { useMemo, useState } from 'react'
import { getCoreRowModel, getPaginationRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { EntityTable } from '@/shared/ui/EntityTable'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { handleApiError } from '@/shared/api/handleApiError'
import { CategoriaForm } from '../components/CategoriaForm'
import { useCategorias } from '../hooks/useCategorias'
import type { Categoria, CategoriaInput } from '../types/Categoria'

const empty: Categoria[] = []
export function AdminCategoriasPage() {
  const {query, crear, actualizar, eliminar} = useCategorias()
  const [current, setCurrent] = useState<Categoria | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  async function guardar(data: CategoriaInput) {
    if (current) await actualizar.mutateAsync({id: current.id, data})
    else await crear.mutateAsync(data)
    setOpen(false)
  }
  async function borrar(c: Categoria) {
    if (!window.confirm(`¿Dar de baja la categoría "${c.nombre}"? Sus productos siguen activos.`)) return
    try { setError(''); await eliminar.mutateAsync(c.id) }
    catch (exc) { setError(handleApiError(exc)) }
  }
  const columns = useMemo<ColumnDef<Categoria>[]>(() => [
    { accessorKey: 'nombre', header: 'Categoría' },
    { accessorKey: 'descripcion', header: 'Descripción' },
    { id: 'acciones', header: 'Acciones', cell: ({row}) => <div className="flex gap-2"><Button variant="outline" onClick={() => {setCurrent(row.original); setOpen(true)}}>Editar</Button><Button variant="danger" onClick={() => void borrar(row.original)}>Dar de baja</Button></div> },
  ], [])
  const table = useReactTable({data: query.data ?? empty, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: {pagination: {pageIndex: 0, pageSize: 10}}})
  return <section className="space-y-5"><div className="flex items-center justify-between gap-3"><div><h1 className="section-title">Categorías</h1><p className="text-sm text-slate-500">ABM con baja lógica</p></div><Button onClick={() => {setCurrent(null); setOpen(true)}}>+ Nueva categoría</Button></div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {query.isPending ? <Skeleton/> : query.isError ? <EstadoError error={query.error} retry={() => void query.refetch()}/> : !query.data.length ? <EstadoVacio mensaje="No hay categorías activas"/> : <EntityTable table={table}/>}
    {open && <Modal title={current ? 'Editar categoría' : 'Nueva categoría'} onClose={() => setOpen(false)}><CategoriaForm key={current?.id ?? 'new'} current={current} onSave={guardar} onClose={() => setOpen(false)}/></Modal>}
  </section>
}
