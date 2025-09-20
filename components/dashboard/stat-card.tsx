'use client'

interface StatCardProps {
  label: string
  value: string | number
  description?: string
  variant?: 'default' | 'header'
}

export default function StatCard({
  label,
  value,
  description,
  variant = 'default',
}: StatCardProps) {
  const isHeader = variant === 'header'

  return (
    <div
      className={`flex flex-col rounded-3xl 
        ${isHeader
          ? 'bg-white/10 border border-white/30 text-white p-4'
          : 'bg-[#FF5E4A]/5 border border-[#FF5E4A]/20 text-[#FF5E4A] p-6'
        }
        shadow-sm transition-colors duration-300`}
    >
      <span className={`text-xs font-semibold uppercase tracking-widest ${isHeader ? 'text-white/80' : 'text-[#FF5E4A]'}`}>
        {label}
      </span>

      <p className={`mt-3 font-semibold ${isHeader ? 'text-3xl md:text-4xl text-white' : 'text-4xl text-[#FF5E4A]'}`}>
        {value}
      </p>

      {description && (
        <p className={`mt-2 text-sm ${isHeader ? 'text-white/70' : 'text-[#FF5E4A]/80'}`}>
          {description}
        </p>
      )}
    </div>
  )
}
