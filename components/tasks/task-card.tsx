'use client'

import { useState } from 'react'
import { Paperclip, MessageSquare } from 'lucide-react'
import { Task, TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_ORDER } from '@/lib/types'
import { formatDate, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { InlineEdit } from '@/components/ui/inline-edit'
import { normalizeStatus } from '@/lib/task-status'

interface TaskCardProps {
  task: Task
  role?: 'admin' | 'user'
  onDelete?: (task: Task) => void
  onUpdate?: (taskId: string, payload: Partial<Task>) => Promise<void>
  onEdit?: (task: Task) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => Promise<void> | void
  onOpenDetails?: (task: Task) => void
}

const priorityBadges: Record<Task['priority'], { label: string; className: string }> = {
  low: {
    label: 'Düşük Öncelik',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
  },
  medium: {
    label: 'Orta Öncelik',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300'
  },
  high: {
    label: 'Yüksek Öncelik',
    className: 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300'
  }
}

function TaskCard({
  task,
  role = 'user',
  onDelete,
  onUpdate,
  onEdit,
  onStatusChange,
  onOpenDetails
}: TaskCardProps) {
  const [statusLoading, setStatusLoading] = useState(false)
  const status = normalizeStatus(task.status)

  const handleStatusSelect = async (nextStatus: TaskStatus) => {
    if (nextStatus === status) return
    try {
      setStatusLoading(true)
      await onStatusChange?.(task.id, nextStatus)
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div
      className="group w-full min-w-0 break-words rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-surface-dark cursor-pointer"
      onClick={() => onOpenDetails?.(task)}
    >
      {/* Üst alan */}
      <div className="flex items-start justify-between gap-3 min-w-0">
        {role === 'admin' ? (
          <InlineEdit
            value={task.title}
            onSave={(next) => onUpdate?.(task.id, { title: next })}
            className="text-base font-semibold text-gray-900 group-hover:text-accent dark:text-white break-words line-clamp-2"
          />
        ) : (
          <h3
            className="rounded-lg px-3 py-2 text-sm font-semibold text-white line-clamp-2 break-words"
            style={{ backgroundColor: '#FF5E4A' }}
          >
            {task.title}
          </h3>
        )}

        {/* Öncelik */}
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium sm:whitespace-nowrap break-words',
            priorityBadges[task.priority].className
          )}
        >
          {priorityBadges[task.priority].label}
        </span>
      </div>

      {/* Açıklama */}
      {role === 'admin' && task.description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 break-words line-clamp-3">
          {task.description}
        </p>
      )}

      {/* Attachment */}
      {task.attachment_url && (
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          {task.attachment_url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
            <img
              src={task.attachment_url}
              alt="Görev görseli"
              className="max-h-40 w-full rounded-md object-cover"
            />
          ) : (
            <a
              href={task.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-accent hover:text-accent-dark break-all"
            >
              <Paperclip className="h-3.5 w-3.5" /> Ek dosya
            </a>
          )}
        </div>
      )}

      {/* Alt alan */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400 min-w-0">
        {/* Bitiş tarihi */}
        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300 break-words">
          Bitiş: {formatDate(task.due_date) || 'Belirtilmedi'}
        </span>

        {role === 'admin' && (
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            {/* Durum seçici */}
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Durum
              </label>
              <select
                value={status}
                onChange={(e) => {
                  e.stopPropagation()
                  handleStatusSelect(e.target.value as TaskStatus)
                }}
                disabled={statusLoading}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-accent focus:border-accent focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                {TASK_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Butonlar */}
            <div
              className="flex flex-wrap items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="outline" className="h-7 px-3 text-xs">Düzenle</Button>
              <Button variant="outline" className="h-7 px-3 text-xs">Detay</Button>
              <Button
                variant="outline"
                className="h-7 px-3 text-xs border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                onClick={() => onDelete?.(task)}
              >
                Sil
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Yorum */}
      {role === 'admin' && (
        <div
          className="mt-4 flex items-center gap-2 text-xs text-gray-500 hover:text-gray-600 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            onOpenDetails?.(task)
          }}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Yorum yap...</span>
        </div>
      )}
    </div>
  )
}

export default TaskCard
