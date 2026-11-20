export function Skeleton() {
  return <div aria-label="Cargando contenido" role="status" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="panel animate-pulse overflow-hidden"><div className="h-36 bg-slate-100"/><div className="space-y-3 p-5"><div className="h-5 rounded bg-slate-100"/><div className="h-4 w-2/3 rounded bg-slate-100"/></div></div>)}
  </div>
}
