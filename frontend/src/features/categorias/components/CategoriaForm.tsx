import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { FieldErrors } from '@/shared/ui/FieldErrors'
import { handleApiError } from '@/shared/api/handleApiError'
import type { Categoria, CategoriaInput } from '../types/Categoria'

export function CategoriaForm({ current, onSave, onClose }: {current: Categoria | null; onSave: (data: CategoriaInput) => Promise<void>; onClose: () => void}) {
  const [error, setError] = useState('')
  const form = useForm({ defaultValues: {nombre: current?.nombre ?? '', descripcion: current?.descripcion ?? ''},
    onSubmit: async ({value}) => { setError(''); try { await onSave(value) } catch (exc) { setError(handleApiError(exc)) } } })
  return <form noValidate className="space-y-4" onSubmit={e => {e.preventDefault(); e.stopPropagation(); void form.handleSubmit()}}>
    <form.Field name="nombre" validators={{onBlur: ({value}) => value.trim().length < 2 || value.length > 100 ? 'El nombre debe tener 2 a 100 caracteres' : undefined}}>{field => <div><label className="field-label">Nombre</label><input className="field-input" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(e.target.value)}/><FieldErrors errors={field.state.meta.errors}/></div>}</form.Field>
    <form.Field name="descripcion">{field => <div><label className="field-label">Descripción</label><textarea className="field-input" value={field.state.value} onChange={e => field.handleChange(e.target.value)}/></div>}</form.Field>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div className="flex gap-2"><form.Subscribe selector={s => [s.canSubmit,s.isSubmitting] as const}>{([canSubmit,submitting]) => <Button type="submit" disabled={!canSubmit || submitting}>{submitting ? 'Guardando…' : 'Guardar'}</Button>}</form.Subscribe><Button variant="outline" onClick={onClose}>Cancelar</Button></div>
  </form>
}
