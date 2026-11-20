import { flexRender, type RowData, type Table } from '@tanstack/react-table'
import { Button } from './Button'
interface Props<T extends RowData> { table: Table<T> }
export function EntityTable<T extends RowData>({ table }: Props<T>) {
  return <div className="panel overflow-hidden"><div className="w-full overflow-x-auto">
    <table className="w-full min-w-[600px] border-collapse text-left text-sm">
      <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {table.getHeaderGroups().map(group => <tr key={group.id}>
          {group.headers.map(header => <th scope="col" key={header.id} className="border-b border-slate-200 px-5 py-4">
            {header.isPlaceholder ? null : <button type="button" disabled={!header.column.getCanSort()} onClick={header.column.getToggleSortingHandler()} className="inline-flex gap-2 font-semibold hover:text-blue-600 disabled:cursor-default">
              {flexRender(header.column.columnDef.header, header.getContext())}
              {header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : header.column.getCanSort() ? '↕' : ''}
            </button>}
          </th>)}
        </tr>)}
      </thead>
      <tbody className="divide-y divide-slate-100">
        {table.getRowModel().rows.map(row => <tr key={row.id} className="transition hover:bg-blue-50/50">
          {row.getVisibleCells().map(cell => <td key={cell.id} className="px-5 py-4 align-middle text-slate-800">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
        </tr>)}
      </tbody>
    </table>
  </div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-4">
    <span className="text-xs text-slate-500">{table.getFilteredRowModel().rows.length} registros · Página {table.getState().pagination.pageIndex + 1} de {Math.max(1, table.getPageCount())}</span>
    <div className="flex gap-2"><Button variant="outline" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Anterior</Button><Button variant="outline" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Siguiente</Button></div>
  </div></div>
}
