'use client'

import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import { cn } from '@/lib/utils'

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors'
  const variants: Record<'primary' | 'secondary' | 'ghost', string> = {
    primary: 'bg-accent text-white hover:opacity-90',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'bg-transparent text-gray-500 hover:text-gray-900'
  }

  return <button className={cn(base, variants[variant], className)} {...props} />
}
