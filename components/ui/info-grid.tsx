import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InfoItem {
  label: string
  value: ReactNode
  helper?: string
}

interface InfoGridProps {
  items: InfoItem[]
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function InfoGrid({ items, columns = 1, className }: InfoGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
  } as const

  return (
    <dl className={cn('grid gap-4', gridCols[columns], className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900/60"
        >
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{item.label}</dt>
          <dd className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{item.value}</dd>
          {item.helper ? (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.helper}</p>
          ) : null}
        </div>
      ))}
    </dl>
  )
}
