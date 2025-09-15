'use client'

import { Task } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InlineEdit } from '@/components/ui/inline-edit'

interface TaskCardProps {
  task: Task
  onDelete: (task: Task) => void
  onUpdate: (taskId: string, payload: Partial<Task>) => Promise<void>
  onEdit: (task: Task) => void
}

const priorityBadges: Record<Task['priority'], { label: string; color: 'orange' | 'gray' | 'green' }> = {
  low: { label: 'Düşük Öncelik', color: 'gray' },
  medium: { label: 'Orta Öncelik', color: 'orange' },
  high: { label: 'Yüksek Öncelik', color: 'orange' }
}

export function TaskCard({ task, onDelete, onUpdate, onEdit }: TaskCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm transition-all duration-300 dark:border-gray-700 dark:bg-surface-dark">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <InlineEdit
            value={task.title}
            onSave={(next) => onUpdate(task.id, { title: next })}
            className="text-sm font-semibold text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{task.description}</p>
          {task.attachment_url && (
            <a
              href={task.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              📎 Ek dosyayı aç
            </a>
          )}
        </div>
        <Badge color={priorityBadges[task.priority].color}>{priorityBadges[task.priority].label}</Badge>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Bitiş: {formatDate(task.due_date)}</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-accent hover:text-accent/80" onClick={() => onEdit(task)}>
            Düzenle
          </Button>
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => onDelete(task)}
          >
            Sil
          </Button>
        </div>
      </div>
    </div>
  )
}
