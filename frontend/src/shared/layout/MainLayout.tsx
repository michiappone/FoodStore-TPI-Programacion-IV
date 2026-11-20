import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
export function MainLayout() { return <div className="min-h-screen"><Navbar/><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><Outlet/></main><footer className="mt-12 border-t border-slate-200 py-7 text-center text-sm text-slate-400">Food Store · Programación IV</footer></div> }
