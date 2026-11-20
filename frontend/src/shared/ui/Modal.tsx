import { useEffect, type ReactNode } from 'react'
import { Button } from './Button'
interface Props { title: string, onClose: () => void, children: ReactNode }
export function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><h2 className="text-lg font-bold">{title}</h2><Button variant="outline" className="px-3 py-1.5" onClick={onClose} aria-label="Cerrar">✕</Button></div>
      <div className="max-h-[75vh] overflow-y-auto px-6 py-6">{children}</div>
    </section>
  </div>
}
