import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useAuthStore } from '@/store/authStore'
import { FieldErrors } from '@/shared/ui/FieldErrors'
import { Button } from '@/shared/ui/Button'
import { handleApiError } from '@/shared/api/handleApiError'

export function LoginPage() {
  const usuario = useAuthStore(s => s.usuario)
  const cargando = useAuthStore(s => s.cargando)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const desde = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'
  const [error, setError] = useState('')
  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError('')
      try { await login(value.username.trim(), value.password); navigate(desde, { replace: true }) }
      catch (exc) { setError(handleApiError(exc)) }
    },
  })
  if (cargando) return <p className="text-center">Verificando sesión…</p>
  if (usuario) return <Navigate to="/" replace />
  return <div className="mx-auto max-w-md panel p-8"><div className="text-4xl">👋</div>
    <h1 className="mt-2 section-title">Bienvenido a Food Store</h1>
    <p className="mb-6 mt-2 text-sm text-slate-500">Ingresá con tu nombre de usuario y contraseña.</p>
    <form noValidate className="space-y-4" onSubmit={e => { e.preventDefault(); e.stopPropagation(); void form.handleSubmit() }}>
      <form.Field name="username" validators={{ onBlur: ({value}) => value.trim() ? undefined : 'Ingresá tu usuario' }}>
        {field => <div><label className="field-label" htmlFor="username">Usuario</label><input id="username" className="field-input" autoComplete="username" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(e.target.value)}/><FieldErrors errors={field.state.meta.errors}/></div>}
      </form.Field>
      <form.Field name="password" validators={{ onBlur: ({value}) => value ? undefined : 'Ingresá tu contraseña' }}>
        {field => <div><label className="field-label" htmlFor="password">Contraseña</label><input id="password" type="password" className="field-input" autoComplete="current-password" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(e.target.value)}/><FieldErrors errors={field.state.meta.errors}/></div>}
      </form.Field>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting] as const}>{([canSubmit, isSubmitting]) => <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>{isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}</Button>}</form.Subscribe>
    </form>
    <p className="mt-6 text-sm">¿Todavía no tenés cuenta? <Link to="/register" className="font-semibold text-brand underline">Registrate</Link></p>
  </div>
}
