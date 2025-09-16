'use client'

import { useState } from 'react'
import { Paperclip } from 'lucide-react'
import { Task, TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_ORDER } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InlineEdit } from '@/components/ui/inline-edit'

interface TaskCardProps {
  task: Task
  onDelete: (task: Task) => void
  onUpdate: (taskId: string, payload: Partial<Task>) => Promise<void>
  onEdit: (task: Task) => void
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void> | void
}

const priorityBadges: Record<Task['priority'], { label: string; color: 'orange' | 'gray' | 'green' }> = {
  low: { label: 'Düşük Öncelik', color: 'gray' },
  medium: { label: 'Orta Öncelik', color: 'orange' },
  high: { label: 'Yüksek Öncelik', color: 'orange' }
}

export function TaskCard({ task, onDelete, onUpdate, onEdit, onStatusChange }: TaskCardProps) {
  const [statusLoading, setStatusLoading] = useState(false)

  const handleStatusSelect = async (nextStatus: TaskStatus) => {
    if (nextStatus === task.status) return
    try {
      setStatusLoading(true)
      await onStatusChange(task.id, nextStatus)
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-card dark:border-gray-700 dark:bg-surface-dark">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <InlineEdit
            value={task.title}
            onSave={(next) => onUpdate(task.id, { title: next })}
            className="text-base font-semibold text-gray-900 transition-colors duration-200 group-hover:text-accent dark:text-white"
          />
          {task.description && <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>}
          {task.attachment_url && (
            <a
              href={task.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-accent transition hover:text-accent-dark"
            >
              <Paperclip className="h-3.5 w-3.5" /> Ek dosyayı aç
            </a>
          )}
        </div>
        <Badge color={priorityBadges[task.priority].color}>{priorityBadges[task.priority].label}</Badge>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          Bitiş: {formatDate(task.due_date) || 'Belirtilmedi'}
        </span>
        <div className="flex flex-1 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Durum</label>
            <select
              value={task.status}
              onChange={(event) => handleStatusSelect(event.target.value as TaskStatus)}
              disabled={statusLoading}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-accent focus:border-accent focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              {TASK_STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-sm" onClick={() => onEdit(task)}>
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
    </div>
  )
}
