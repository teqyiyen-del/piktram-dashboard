'use client'

interface StatCardProps {
  label: string
  value: string | number
  description?: string
  role?: 'admin' | 'user'
}

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div
      className="flex flex-col rounded-3xl border border-[#FF5E4A]/20 bg-[#FF5E4A]/5 
                 p-6 shadow-sm transition-colors duration-300"
    >
      {/* Label */}
      <span className="text-xs font-semibold uppercase tracking-widest text-[#FF5E4A]">
        {label}
      </span>

      {/* Value */}
      <p className="mt-3 text-4xl font-semibold text-[#FF5E4A]">
        {value}
      </p>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm text-[#FF5E4A]/80">
          {description}
        </p>
      )}
    </div>
  )
}
