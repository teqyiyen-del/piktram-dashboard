import { Task } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface TodayTasksProps {
  tasks: Task[]
}

const priorityLabels: Record<Task['priority'], { label: string; color: 'orange' | 'gray' | 'green' }> = {
  low: { label: 'Düşük', color: 'gray' },
  medium: { label: 'Orta', color: 'orange' },
  high: { label: 'Yüksek', color: 'orange' }
}

export function TodayTasks({ tasks }: TodayTasksProps) {
  if (tasks.length === 0) {
    return (
<<<<<<< HEAD
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark dark:text-gray-400">
=======
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
>>>>>>> codex-restore-ux
        Bugün için planlanmış görev bulunmuyor.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
<<<<<<< HEAD
        <div
          key={task.id}
          className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {task.title}{' '}
              {task.attachment_url && (
                <a
                  href={task.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-xs text-accent"
                >
                  📎
                </a>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{task.description}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Badge color={priorityLabels[task.priority].color}>{priorityLabels[task.priority].label}</Badge>
            <span className="text-gray-500 dark:text-gray-400">{formatDate(task.due_date)}</span>
=======
        <div key={task.id} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">{task.title}</p>
            <p className="text-xs text-gray-500">{task.description}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Badge color={priorityLabels[task.priority].color}>{priorityLabels[task.priority].label}</Badge>
            <span className="text-gray-500">{formatDate(task.due_date)}</span>
>>>>>>> codex-restore-ux
          </div>
        </div>
      ))}
    </div>
  )
}
