import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const tagColorMap = {
  accent: 'bg-accent/10 text-accent',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
} as const

const toneMap = {
  accent: 'bg-accent/10 text-accent dark:bg-accent/15',
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300'
} as const

type TagColor = keyof typeof tagColorMap
type Tone = keyof typeof toneMap

interface ListItemProps {
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  icon?: ReactNode
  tag?: string
  tagColor?: TagColor
  rightSlot?: ReactNode
  className?: string
  compact?: boolean
  tone?: Tone
}

export function ListItem({
  title,
  description,
  meta,
  icon,
  tag,
  tagColor = 'accent',
  rightSlot,
  className,
  compact = false,
  tone = 'accent'
}: ListItemProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark/80',
        compact ? 'py-3' : 'py-4',
        className
      )}
    >
      <div className="flex flex-1 items-start gap-3">
        {icon ? (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base',
              toneMap[tone]
            )}
          >
            {icon}
          </div>
        ) : null}

        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </div>
            {tag ? (
              <span className={cn('pill', tagColorMap[tagColor])}>{tag}</span>
            ) : null}
          </div>

          {description ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
          ) : null}

          {meta ? (
            <div className="text-xs text-gray-400 dark:text-gray-500">{meta}</div>
          ) : null}
        </div>
      </div>

      {rightSlot ? (
        <div className="flex shrink-0 items-center text-xs text-gray-500 dark:text-gray-400">
          {rightSlot}
        </div>
      ) : null}
    </div>
  )
}
