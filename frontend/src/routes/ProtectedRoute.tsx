import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Array<'user' | 'admin'> }) {
  const { usuario, cargando } = useAuthStore()
  const location = useLocation()
  if (cargando) return <div role="status" className="p-12 text-center text-slate-600">Verificando sesión…</div>
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />
  if (allowedRoles && !allowedRoles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
