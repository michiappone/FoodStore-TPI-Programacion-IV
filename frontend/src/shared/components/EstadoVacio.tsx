export function EstadoVacio({ mensaje = 'Todavía no hay resultados' }: { mensaje?: string }) {
  return <div className="panel p-12 text-center text-slate-500"><div className="text-4xl">☕</div><p className="mt-3 font-medium">{mensaje}</p></div>
}
