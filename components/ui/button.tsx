'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white shadow-brand-sm hover:bg-accent-dark',
  secondary:
    'bg-white text-gray-700 shadow-sm ring-1 ring-inset ring-border hover:text-accent hover:ring-accent dark:bg-surface-dark dark:text-gray-100 dark:ring-gray-700 dark:hover:text-accent',
  outline:
    'bg-transparent text-gray-700 ring-1 ring-inset ring-border hover:bg-white/70 hover:text-accent dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-surface-dark/60',
  ghost:
    'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm',
  md: 'px-4 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base',
  lg: 'px-5 py-2.5 text-base sm:px-6 sm:py-3 sm:text-lg',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
