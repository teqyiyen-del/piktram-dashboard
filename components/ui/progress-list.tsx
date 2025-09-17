import { cn } from '@/lib/utils'

export interface ProgressItem {
  title: string
  value: number
  targetLabel?: string
  description?: string
  tone?: 'accent' | 'emerald' | 'violet' | 'amber' | 'orange'
}

const toneMap: Record<NonNullable<ProgressItem['tone']>, string> = {
  accent: 'from-[#FF5E4A] to-[#FF8469]',
  emerald: 'from-emerald-500 to-emerald-400',
  violet: 'from-violet-500 to-violet-400',
  amber: 'from-amber-500 to-amber-400',
  orange: 'from-orange-500 to-orange-400'
}

export function ProgressList({ items }: { items: ProgressItem[] }) {
  return (
    <div className="space-y-5">
      {items.map((item) => {
        const percentage = Math.min(Math.max(item.value, 0), 100)
        const tone = item.tone ?? 'accent'
        return (
          <div
            key={item.title}
            className="space-y-2 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900/60"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <span className="pill bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                %{percentage.toFixed(0)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                  toneMap[tone]
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            {item.targetLabel ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.targetLabel}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
