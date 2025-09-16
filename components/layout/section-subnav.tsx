'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SectionSubnavItem {
  label: string
  href: string
  description?: string
}

interface SectionSubnavProps {
  items: SectionSubnavItem[]
}

export function SectionSubnav({ items }: SectionSubnavProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white/80 p-4 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-surface-dark/70">
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-accent text-white shadow-brand-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-accent/10 hover:text-accent dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold uppercase tracking-wide',
                  isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-500 dark:bg-gray-800'
                )}
              >
                {item.label[0]}
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          if (!item.description) return null
          const isActive = pathname === item.href
          return (
            <Link
              key={`${item.href}-description`}
              href={item.href}
              className={cn(
                'rounded-2xl border px-4 py-3 text-xs leading-relaxed text-gray-500 transition-colors duration-200 dark:text-gray-400',
                isActive
                  ? 'border-accent/60 bg-accent/5 text-accent dark:border-accent/40 dark:bg-accent/10'
                  : 'border-gray-200 bg-white hover:border-accent/40 hover:text-accent dark:border-gray-800 dark:bg-gray-900/60'
              )}
            >
              {item.description}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
