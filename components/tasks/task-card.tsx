'use client'

import { Task } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getStatusLabel, normalizeStatus } from '@/lib/task-status'

interface TaskCardProps {
  task: Task
  onDelete: (task: Task) => void
  onOpen: (task: Task) => void
}

const priorityBadges: Record<Task['priority'], { label: string; color: 'orange' | 'gray' | 'green' }> = {
  low: { label: 'Düşük Öncelik', color: 'gray' },
  medium: { label: 'Orta Öncelik', color: 'orange' },
  high: { label: 'Yüksek Öncelik', color: 'orange' }
}

export function TaskCard({ task, onDelete, onOpen }: TaskCardProps) {
  const status = normalizeStatus(task.status)
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
          <p className="mt-1 text-xs text-gray-500">{task.description}</p>
        </div>
        <Badge color={priorityBadges[task.priority].color}>{priorityBadges[task.priority].label}</Badge>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex flex-col gap-1">
          <span>Bitiş: {formatDate(task.due_date)}</span>
          <span className="text-[11px] font-medium text-accent">Durum: {getStatusLabel(status)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="secondary" className="text-xs" onClick={() => onOpen(task)}>
            Detay
          </Button>
          <Button variant="ghost" className="text-red-500" onClick={() => onDelete(task)}>
            Sil
          </Button>
        </div>
      </div>
    </div>
  )
}
