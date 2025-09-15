'use client'

import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import { cn } from '@/lib/utils'

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-accent text-white shadow-brand-sm hover:bg-accent-dark',
    secondary:
      'bg-white text-gray-700 shadow-sm ring-1 ring-inset ring-border hover:text-accent hover:ring-accent dark:bg-surface-dark dark:text-gray-100 dark:ring-gray-700 dark:hover:text-accent',
    outline:
      'bg-transparent text-gray-700 ring-1 ring-inset ring-border hover:bg-white/70 hover:text-accent dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-surface-dark/60',
    ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
  }

  return <button className={cn(base, variants[variant], className)} {...props} />
}
