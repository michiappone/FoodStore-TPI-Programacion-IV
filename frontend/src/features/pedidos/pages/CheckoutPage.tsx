import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useCartStore } from '@/store/cartStore'
import { useCrearPedido } from '../hooks/usePedidos'
import { Button } from '@/shared/ui/Button'
import { FieldErrors } from '@/shared/ui/FieldErrors'
import { handleApiError } from '@/shared/api/handleApiError'
import type {FormaPago} from '../types/Pedido'

export function CheckoutPage() {
  const items = useCartStore(s => s.items)
  const vaciar = useCartStore(s => s.vaciar)
  const total = useCartStore(s => s.total)
  const crear = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const form = useForm({defaultValues: {direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: ''},
    onSubmit: async ({value}) => {
      setError('')
      if (!items.length) {setError('Tu carrito está vacío'); return}
      try {
        await crear.mutateAsync({items: items.map(x => ({producto_id: x.producto_id,cantidad: x.cantidad})),
          direccion_entrega: value.direccion_entrega,forma_pago: value.forma_pago,notas: value.notas || null})
        vaciar()
        navigate('/mis-pedidos',{replace: true})
      } catch (exc) {setError(handleApiError(exc))}
    }})
  if (!items.length) return <div><h1 className="section-title">Confirmar pedido</h1><p className="my-5">Tu carrito está vacío.</p><Link to="/" className="text-brand underline">Ir al catálogo</Link></div>
  return <section className="mx-auto max-w-xl"><h1 className="section-title">Confirmar pedido</h1><p className="mb-6 mt-2 text-slate-500">{items.length} productos · Total estimado ${total().toLocaleString('es-AR')}</p>
    <form noValidate className="panel space-y-5 p-7" onSubmit={e => {e.preventDefault();e.stopPropagation();void form.handleSubmit()}}>
      <form.Field name="direccion_entrega" validators={{onBlur: ({value}) => value.trim().length < 5 || value.length > 200 ? 'La dirección debe tener entre 5 y 200 caracteres' : undefined}}>{field => <div><label className="field-label">Dirección de entrega</label><input className="field-input" placeholder="Calle 123, Córdoba" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(e.target.value)}/><FieldErrors errors={field.state.meta.errors}/></div>}</form.Field>
      <form.Field name="forma_pago">{field => <div><label className="field-label">Forma de pago</label><select className="field-input" value={field.state.value} onChange={e => field.handleChange(e.target.value as FormaPago)}><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option></select></div>}</form.Field>
      <form.Field name="notas">{field => <div><label className="field-label">Notas (opcional)</label><textarea rows={3} className="field-input" value={field.state.value} onChange={e => field.handleChange(e.target.value)}/></div>}</form.Field>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form.Subscribe selector={s => [s.canSubmit,s.isSubmitting] as const}>{([valid,loading]) => <Button type="submit" className="w-full" disabled={!valid || loading}>{loading ? 'Procesando pedido…' : 'Confirmar compra'}</Button>}</form.Subscribe>
    </form>
  </section>
}
