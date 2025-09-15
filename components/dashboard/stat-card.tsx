interface StatCardProps {
  label: string
  value: string | number
  description?: string
}

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
      {description && <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{description}</p>}
    </div>
  )
}
