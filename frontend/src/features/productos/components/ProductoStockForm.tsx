import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { FieldErrors } from '@/shared/ui/FieldErrors'
import { handleApiError } from '@/shared/api/handleApiError'
import type { Producto } from '../types/Producto'
export function ProductoStockForm({producto,guardar, cerrar}: {producto: Producto; guardar: (stock: number, disponible: boolean) => Promise<void>; cerrar: () => void}) {
  const [error,setError] = useState('')
  const form = useForm({defaultValues: {stock: producto.stock, disponible: producto.disponible},onSubmit: async ({value}) => {setError('');try {await guardar(value.stock,value.disponible)} catch (exc) {setError(handleApiError(exc))}}})
  return <form noValidate className="space-y-4" onSubmit={e => {e.preventDefault();e.stopPropagation();void form.handleSubmit()}}>
    <form.Field name="stock" validators={{onBlur: ({value}) => Number.isInteger(value) && value >= 0 ? undefined : 'Stock entero no negativo'}}>{field => <div><label className="field-label">Unidades disponibles</label><input type="number" min="0" step="1" className="field-input" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(Number(e.target.value))}/><FieldErrors errors={field.state.meta.errors}/></div>}</form.Field>
    <form.Field name="disponible">{field => <label className="flex gap-2 text-sm"><input type="checkbox" checked={field.state.value} onChange={e => field.handleChange(e.target.checked)}/> Disponible</label>}</form.Field>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div className="flex gap-2"><form.Subscribe selector={s => [s.canSubmit,s.isSubmitting] as const}>{([valid,loading]) => <Button type="submit" disabled={!valid || loading}>Guardar stock</Button>}</form.Subscribe><Button variant="outline" onClick={cerrar}>Cancelar</Button></div>
  </form>
}
