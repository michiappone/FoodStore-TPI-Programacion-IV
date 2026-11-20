import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { FieldErrors } from '@/shared/ui/FieldErrors'
import { handleApiError } from '@/shared/api/handleApiError'
import type { Categoria } from '@/features/categorias/types/Categoria'
import type { Producto, ProductoInput } from '../types/Producto'

export function ProductoForm({current, categorias, onSave, onClose}: {
  current: Producto | null; categorias: Categoria[]; onSave: (data: ProductoInput) => Promise<void>; onClose: () => void
}) {
  const [error,setError] = useState('')
  const form = useForm({defaultValues: {nombre: current?.nombre ?? '', descripcion: current?.descripcion ?? '',
    precio_base: current?.precio_base ?? 0, imagen_url: current?.imagen_url ?? '', stock: current?.stock ?? 0,
    disponible: current?.disponible ?? true, categoria_id: current?.categoria_id ?? categorias[0]?.id ?? 0},
    onSubmit: async ({value}) => {setError('');try {await onSave(value)} catch (exc) {setError(handleApiError(exc))}}})
  return <form noValidate className="space-y-4" onSubmit={e => {e.preventDefault();e.stopPropagation();void form.handleSubmit()}}>
    <form.Field name="nombre" validators={{onBlur: ({value}) => value.trim() ? undefined : 'Nombre obligatorio'}}>{field => <div><label className="field-label">Nombre</label><input className="field-input" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(e.target.value)}/><FieldErrors errors={field.state.meta.errors}/></div>}</form.Field>
    <form.Field name="categoria_id" validators={{onBlur: ({value}) => value > 0 ? undefined : 'Elegí una categoría'}}>{field => <div><label className="field-label">Categoría</label><select className="field-input" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(Number(e.target.value))}><option value={0}>Elegir categoría</option>{categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select><FieldErrors errors={field.state.meta.errors}/></div>}</form.Field>
    <form.Field name="descripcion">{field => <div><label className="field-label">Descripción</label><textarea className="field-input" value={field.state.value} onChange={e => field.handleChange(e.target.value)}/></div>}</form.Field>
    <form.Field name="precio_base" validators={{onBlur: ({value}) => value >= 0 ? undefined : 'Precio no puede ser negativo'}}>{field => <div><label className="field-label">Precio ($)</label><input type="number" min="0" step="0.01" className="field-input" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(Number(e.target.value))}/><FieldErrors errors={field.state.meta.errors}/></div>}</form.Field>
    <form.Field name="imagen_url">{field => <div><label className="field-label">URL de imagen (opcional)</label><input className="field-input" value={field.state.value} onChange={e => field.handleChange(e.target.value)}/></div>}</form.Field>
    <form.Field name="stock" validators={{onBlur: ({value}) => Number.isInteger(value) && value >= 0 ? undefined : 'Stock entero no negativo'}}>{field => <div><label className="field-label">Stock inicial</label><input type="number" min="0" step="1" className="field-input" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(Number(e.target.value))}/><FieldErrors errors={field.state.meta.errors}/></div>}</form.Field>
    <form.Field name="disponible">{field => <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={field.state.value} onChange={e => field.handleChange(e.target.checked)}/> Disponible para vender</label>}</form.Field>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div className="flex gap-2"><form.Subscribe selector={s => [s.canSubmit,s.isSubmitting] as const}>{([canSubmit,submitting]) => <Button type="submit" disabled={!canSubmit || submitting}>{submitting ? 'Guardando…' : 'Guardar'}</Button>}</form.Subscribe><Button variant="outline" onClick={onClose}>Cancelar</Button></div>
  </form>
}
