import type { ButtonHTMLAttributes } from 'react'
type Variant = 'primary' | 'outline' | 'danger' | 'soft'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant }
const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover shadow-sm',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  soft: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
}
export function Button({ variant = 'primary', type = 'button', className = '', children, ...props }: ButtonProps) {
  return <button type={type} className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>{children}</button>
}
