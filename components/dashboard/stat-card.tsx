'use client'

interface StatCardProps {
  label: string
  value: string | number
  description?: string
  variant?: 'default' | 'header'
}

export function StatCard({ label, value, description, variant = 'default' }: StatCardProps) {
  const isHeader = variant === 'header'

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl text-center shadow-sm transition-colors duration-300
        ${isHeader ? 'bg-white/10 text-white p-6 backdrop-blur' : 'bg-white/80 dark:bg-surface-dark/80 p-4'}
      `}
    >
      {/* Label */}
      <span
        className={`text-xs font-semibold uppercase tracking-wide 
          ${isHeader ? 'text-white/70' : 'text-gray-500'}
        `}
      >
        {label}
      </span>

      {/* Value */}
      <p
        className={`mt-4 mb-2 text-3xl font-bold leading-none 
          ${isHeader ? 'text-white text-4xl' : 'text-gray-900'}
        `}
      >
        {value}
      </p>

      {/* Description */}
      {description && (
        <p className={`text-sm ${isHeader ? 'text-white/80' : 'text-gray-400'}`}>
          {description}
        </p>
      )}
    </div>
  )
}
