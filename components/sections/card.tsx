import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  title?: string
  description?: string
  badge?: string
  actions?: ReactNode
  children?: ReactNode
  className?: string
  contentClassName?: string
}

export function Card({
  title,
  description,
  badge,
  actions,
  children,
  className,
  contentClassName,
}: CardProps) {
  const showHeader = title || description || badge || actions

  return (
    <section
      className={cn(
        'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900',
        className
      )}
    >
      {showHeader && (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            {badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-accent">
                {badge}
              </span>
            )}

            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}

            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </header>
      )}

      {children && (
        <div className={cn(showHeader ? 'mt-6' : '', contentClassName)}>
          {children}
        </div>
      )}
    </section>
  )
}
