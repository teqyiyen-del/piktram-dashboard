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

export function Card({ title, description, badge, actions, children, className, contentClassName }: CardProps) {
  const showHeader = title || description || badge || actions

  return (
    <section className={cn('card-section h-full', className)}>
      {showHeader ? (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            {badge ? (
              <span className="pill inline-flex items-center gap-1 bg-accent/10 text-xs font-semibold uppercase tracking-wide text-accent">
                {badge}
              </span>
            ) : null}
            {title ? <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3> : null}
            {description ? <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      {children ? <div className={cn(showHeader ? 'mt-6' : '', contentClassName)}>{children}</div> : null}
    </section>
  )
}
