import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: ReactNode
  color?: 'orange' | 'gray' | 'green'
}

export function Badge({ children, color = 'gray' }: BadgeProps) {
  const colors: Record<typeof color, string> = {
    orange: 'bg-accent/10 text-accent',
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-emerald-100 text-emerald-700'
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-1 text-xs font-medium', colors[color])}>
      {children}
    </span>
  )
}
