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
  onDelete: (task: Task) => void
  onUpdate: (taskId: string, payload: Partial<Task>) => Promise<void>
  onEdit: (task: Task) => void
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void> | void
  onOpenDetails: (task: Task) => void
}

const priorityBadges: Record<Task['priority'], { label: string; className: string }> = {
  low: {
    label: 'Düşük Öncelik',
    className: 'border border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-300'
  },
  medium: {
    label: 'Orta Öncelik',
    className: 'border border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-300'
  },
  high: {
    label: 'Yüksek Öncelik',
    className: 'border border-rose-500 text-rose-600 dark:border-rose-400 dark:text-rose-300'
  }
}

function TaskCard({
  task,
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
      await onStatusChange(task.id, nextStatus)
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div
      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-surface-dark cursor-pointer"
      onClick={() => onOpenDetails(task)}
    >
      {/* Üst alan */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2 min-w-0">
          <InlineEdit
            value={task.title}
            onSave={(next) => onUpdate(task.id, { title: next })}
            className="text-base font-semibold text-gray-900 group-hover:text-accent dark:text-white break-words line-clamp-2"
          />
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 break-words line-clamp-3">
              {task.description}
            </p>
          )}
          {task.attachment_url && (
            <a
              href={task.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-accent hover:text-accent-dark"
              onClick={(e) => e.stopPropagation()}
            >
              <Paperclip className="h-3.5 w-3.5" /> Ek dosya
            </a>
          )}
        </div>
        {/* Priority Badge */}
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium bg-transparent whitespace-nowrap',
            priorityBadges[task.priority].className
          )}
        >
          {priorityBadges[task.priority].label}
        </span>
      </div>

      {/* Alt alan */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300 whitespace-nowrap">
          Bitiş: {formatDate(task.due_date) || 'Belirtilmedi'}
        </span>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
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
            <Button variant="outline" className="h-7 px-3 text-xs whitespace-nowrap" onClick={() => onEdit(task)}>
              Düzenle
            </Button>
            <Button variant="outline" className="h-7 px-3 text-xs whitespace-nowrap" onClick={() => onOpenDetails(task)}>
              Detay
            </Button>
            <Button
              variant="outline"
              className="h-7 px-3 text-xs border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 whitespace-nowrap"
              onClick={() => onDelete(task)}
            >
              Sil
            </Button>
          </div>
        </div>
      </div>

      {/* Yorum ikonlu hızlı giriş */}
      <div
        className="mt-4 flex items-center gap-2 text-xs text-gray-500 hover:text-gray-600 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onOpenDetails(task)
        }}
      >
        <MessageSquare className="h-4 w-4" />
        <span>Yorum yap...</span>
      </div>
    </div>
  )
}

export default TaskCard   // ✅ ekledik
