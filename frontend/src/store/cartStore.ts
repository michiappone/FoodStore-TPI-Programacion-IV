import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '@/features/productos/types/Producto'

export type ItemCarrito = { producto_id: number; nombre: string; precio_unitario: number; cantidad: number }
type CartState = {
  items: ItemCarrito[]
  agregar: (producto: Producto) => void
  quitar: (producto_id: number) => void
  cambiarCantidad: (producto_id: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(persist((set, get) => ({
  items: [],
  agregar: producto => set(state => {
    const old = state.items.find(x => x.producto_id === producto.id)
    if (old) return { items: state.items.map(x => x.producto_id === producto.id ? { ...x, cantidad: x.cantidad + 1 } : x) }
    return { items: [...state.items, { producto_id: producto.id, nombre: producto.nombre,
             precio_unitario: producto.precio_base, cantidad: 1 }] }
  }),
  quitar: id => set(state => ({ items: state.items.filter(x => x.producto_id !== id) })),
  cambiarCantidad: (id, cantidad) => set(state => ({ items: state.items.map(x =>
    x.producto_id === id ? { ...x, cantidad: Math.max(1, Math.trunc(cantidad)) } : x) })),
  vaciar: () => set({ items: [] }),
  total: () => get().items.reduce((acc, x) => acc + x.precio_unitario * x.cantidad, 0),
}), { name: 'foodstore-carrito' }))
