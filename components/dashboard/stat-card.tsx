interface StatCardProps {
  label: string
  value: string | number
  description?: string
}

export function StatCard({ label, value, description }: StatCardProps) {
  return (
<<<<<<< HEAD
    <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-brand-card transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</span>
      <p className="mt-3 text-4xl font-semibold text-gray-900 dark:text-white">{value}</p>
      {description && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
=======
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {description && <p className="mt-2 text-xs text-gray-400">{description}</p>}
>>>>>>> codex-restore-ux
    </div>
  )
}
