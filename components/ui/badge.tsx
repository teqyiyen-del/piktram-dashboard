import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: ReactNode
  color?: 'orange' | 'gray' | 'green'
}

export function Badge({ children, color = 'gray' }: BadgeProps) {
  const colors: Record<typeof color, string> = {
<<<<<<< HEAD
    orange: 'bg-accent/15 text-accent',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', colors[color])}>
=======
    orange: 'bg-accent/10 text-accent',
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-emerald-100 text-emerald-700'
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-1 text-xs font-medium', colors[color])}>
>>>>>>> codex-restore-ux
      {children}
    </span>
  )
}
