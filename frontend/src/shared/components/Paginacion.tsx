import { Button } from '@/shared/ui/Button'

export function Paginacion({ pagina, total, limite, onChange }: { pagina: number; total: number; limite: number; onChange: (value: number) => void }) {
  const paginas = Math.max(1, Math.ceil(total / limite))
  return <div className="flex items-center justify-between gap-3 py-4">
    <span className="text-sm text-slate-500">{total} resultados · Página {pagina + 1} de {paginas}</span>
    <div className="flex gap-2"><Button variant="outline" disabled={pagina === 0} onClick={() => onChange(pagina - 1)}>Anterior</Button>
    <Button variant="outline" disabled={pagina + 1 >= paginas} onClick={() => onChange(pagina + 1)}>Siguiente</Button></div>
  </div>
}
