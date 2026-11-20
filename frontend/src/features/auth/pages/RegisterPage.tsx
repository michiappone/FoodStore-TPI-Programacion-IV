import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { authApi } from '../api/auth'
import { handleApiError } from '@/shared/api/handleApiError'
import { FieldErrors } from '@/shared/ui/FieldErrors'
import { Button } from '@/shared/ui/Button'

export function RegisterPage() {
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({value}) => {
      setError('')
      try { await authApi.registrar(value); navigate('/login', { replace: true }) }
      catch (exc) { setError(handleApiError(exc)) }
    },
  })
  return <div className="mx-auto max-w-lg panel p-8"><h1 className="section-title">Crear cuenta</h1><p className="mb-6 mt-2 text-sm text-slate-500">Registrate para comprar. Tu cuenta se crea con rol cliente.</p>
    <form noValidate className="space-y-4" onSubmit={e => { e.preventDefault(); e.stopPropagation(); void form.handleSubmit() }}>
      <form.Field name="username" validators={{onBlur: ({value}) => value.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined}}>{field => <div><label className="field-label">Nombre de usuario</label><input className="field-input" autoComplete="username" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(e.target.value)}/><FieldErrors errors={field.state.meta.errors}/></div>}</form.Field>
      <form.Field name="full_name" validators={{onBlur: ({value}) => value.trim() ? undefined : 'Ingresá tu nombre'}}>{field => <div><label className="field-label">Nombre completo</label><input className="field-input" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(e.target.value)}/><FieldErrors errors={field.state.meta.errors}/></div>}</form.Field>
      <form.Field name="email" validators={{onBlur: ({value}) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? undefined : 'Email inválido'}}>{field => <div><label className="field-label">Email</label><input type="email" className="field-input" autoComplete="email" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(e.target.value)}/><FieldErrors errors={field.state.meta.errors}/></div>}</form.Field>
      <form.Field name="password" validators={{onBlur: ({value}) => value.length < 8 ? 'Mínimo 8 caracteres' : undefined}}>{field => <div><label className="field-label">Contraseña</label><input type="password" className="field-input" autoComplete="new-password" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(e.target.value)}/><FieldErrors errors={field.state.meta.errors}/></div>}</form.Field>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form.Subscribe selector={s => [s.canSubmit,s.isSubmitting] as const}>{([canSubmit,submitting]) => <Button type="submit" className="w-full" disabled={!canSubmit || submitting}>{submitting ? 'Registrando…' : 'Registrarme'}</Button>}</form.Subscribe>
    </form><p className="mt-5 text-sm">¿Ya tenés cuenta? <Link to="/login" className="font-semibold text-brand underline">Ingresá</Link></p>
  </div>
}
