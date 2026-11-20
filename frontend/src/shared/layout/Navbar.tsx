import { NavLink, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/shared/ui/Button'

const items = [
  { to: '/', name: 'Catálogo' }, { to: '/carrito', name: 'Carrito' }, { to: '/mis-pedidos', name: 'Mis pedidos' },
]
const adminItems = [
  { to: '/admin/resumen', name: 'Resumen' }, { to: '/admin/categorias', name: 'Categorías' },
  { to: '/admin/productos', name: 'Productos' }, { to: '/admin/pedidos', name: 'Pedidos' },
  { to: '/admin/usuarios', name: 'Usuarios' },
]
export function Navbar() {
  const user = useAuthStore(s => s.usuario)
  const logout = useAuthStore(s => s.logout)
  const itemsCount = useCartStore(s => s.items.reduce((sum, item) => sum + item.cantidad, 0))
  const navigate = useNavigate()
  const client = useQueryClient()
  async function salir() {
    try { await logout() } catch { /* Se limpia el estado aunque la sesión expire. */ }
    client.clear()
    navigate('/login', { replace: true })
  }
  return <header className="border-b border-emerald-900/10 bg-white/95 shadow-sm">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <NavLink to="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-brand"><span className="text-2xl">🥗</span> Food Store</NavLink>
      <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-1">
        {items.map(x => <NavLink key={x.to} to={x.to} end={x.to === '/'} className={({isActive}) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-emerald-50 text-brand' : 'text-slate-600 hover:bg-slate-50'}`}>{x.name}{x.to === '/carrito' && itemsCount > 0 ? ` (${itemsCount})` : ''}</NavLink>)}
      </nav>
      <div className="flex items-center gap-3 text-sm">
        {user ? <><span className="max-w-40 truncate text-slate-500">{user.full_name} · {user.role}</span><Button variant="outline" onClick={() => void salir()}>Cerrar sesión</Button></> : <><NavLink className="text-brand" to="/login">Ingresar</NavLink><NavLink className="rounded-xl bg-brand px-4 py-2 font-semibold text-white" to="/register">Registrarse</NavLink></>}
      </div>
    </div>
    {user?.role === 'admin' && <nav aria-label="Administración" className="border-t border-slate-100 bg-slate-50"><div className="mx-auto flex max-w-7xl flex-wrap gap-1 px-4 py-2 sm:px-6"><span className="mr-2 self-center text-xs font-bold uppercase tracking-wider text-slate-400">Panel</span>{adminItems.map(x => <NavLink key={x.to} to={x.to} className={({isActive}) => `rounded-lg px-3 py-1.5 text-sm ${isActive ? 'bg-brand text-white' : 'text-slate-600 hover:bg-white'}`}>{x.name}</NavLink>)}</div></nav>}
  </header>
}
