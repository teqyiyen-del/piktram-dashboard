interface SectionPlaceholderProps {
  title: string
  description?: string
}

export function SectionPlaceholder({ title, description }: SectionPlaceholderProps) {
  return (
    <section className="rounded-3xl border border-dashed border-gray-200 bg-white/80 p-12 text-center shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-surface-dark/80">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        {description ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        ) : null}
      </div>
    </section>
  )
}
