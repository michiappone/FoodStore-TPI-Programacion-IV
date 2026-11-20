import { Button } from '@/shared/ui/Button'
import { handleApiError } from '@/shared/api/handleApiError'
export function EstadoError({ error, retry }: { error: unknown; retry?: () => void }) {
  return <div role="alert" className="panel border-red-200 p-6 text-red-700"><strong>No se pudieron cargar los datos</strong><p className="mt-2 text-sm">{handleApiError(error)}</p>{retry && <Button className="mt-4" onClick={retry}>Reintentar</Button>}</div>
}
