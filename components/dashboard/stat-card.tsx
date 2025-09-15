interface StatCardProps {
  label: string
  value: string | number
  description?: string
}

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {description && <p className="mt-2 text-xs text-gray-400">{description}</p>}
    </div>
  )
}
