import { Button } from './Button'
import { Card } from './Card'
export function LoadingState() { return <Card className="space-y-4 p-6" ><div role="status" aria-label="Cargando datos" className="space-y-4">{[1,2,3,4].map(n => <div className="h-12 animate-pulse rounded-lg bg-slate-100" key={n} />)}<span className="sr-only">Cargando datos...</span></div></Card> }
export function ErrorState({ error, onRetry }: { error: Error, onRetry: () => void }) {
  return <Card className="border-red-200 p-6"><div role="alert"><h3 className="font-semibold text-red-700">No se pudieron cargar los datos</h3><p className="mt-2 text-sm text-slate-600">{error.message}</p><Button variant="outline" className="mt-4" onClick={onRetry}>Reintentar</Button></div></Card>
}
export function EmptyState({ kind }: { kind: string }) { return <Card className="p-12 text-center"><div className="text-4xl text-slate-300">◌</div><h3 className="mt-3 text-base font-semibold">Todavía no hay {kind}</h3><p className="mt-1 text-sm text-slate-500">Usá el botón de agregar para registrar el primer elemento.</p></Card> }
