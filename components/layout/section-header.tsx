'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  badge?: string
  actions?: ReactNode
  gradient?: boolean
}

export function SectionHeader({ title, subtitle, badge, actions, gradient = false }: SectionHeaderProps) {
  return (
    <section
      className={clsx(
        'flex items-center justify-between rounded-3xl px-8 py-6',
        gradient
          ? 'bg-gradient-to-r from-[#FF5E4A] via-[#FA7C6B] to-[#FF8469] text-white'
          : 'bg-muted text-foreground'
      )}
    >
      <div className="space-y-1">
        {badge && (
          <p
            className={clsx(
              'text-xs font-semibold uppercase tracking-widest',
              gradient ? 'text-white/70' : 'text-gray-500'
            )}
          >
            {badge}
          </p>
        )}
        <h1 className={clsx('text-2xl font-bold', gradient && 'text-white')}>{title}</h1>
        {subtitle && (
          <p className={clsx('text-sm', gradient ? 'text-white/85' : 'text-gray-600')}>{subtitle}</p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </section>
  )
}
