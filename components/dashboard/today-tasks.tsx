'use client'

import { Task } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface TodayTasksProps {
  tasks: Task[]
  role?: 'admin' | 'user'
}

const priorityLabels: Record<Task['priority'], { label: string; color: string }> = {
  low: { label: 'Düşük', color: '#9ca3af' },   // gri
  medium: { label: 'Orta', color: '#FF5E4A' }, // turuncu
  high: { label: 'Yüksek', color: '#dc2626' }  // kırmızı
}

export function TodayTasks({ tasks }: TodayTasksProps) {
  if (tasks.length === 0) {
    return (
      <div
        className="rounded-3xl border border-dashed border-[#FF5E4A]/40 bg-[#FF5E4A]/5 
                   p-8 text-center text-sm text-[#FF5E4A] shadow-sm transition-colors duration-300"
      >
        Bugün için planlanmış görev bulunmuyor.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex flex-col gap-3 rounded-3xl border border-[#FF5E4A]/20 bg-[#FF5E4A]/5 
                     p-5 shadow-sm transition-colors duration-300 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-[#FF5E4A]">
              {task.title}{' '}
              {task.attachment_url && (
                <a
                  href={task.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-xs text-[#FF5E4A]"
                >
                  📎
                </a>
              )}
            </p>
            <p className="text-xs text-[#FF5E4A]/80">{task.description}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Badge style={{ backgroundColor: priorityLabels[task.priority].color, color: 'white' }}>
              {priorityLabels[task.priority].label}
            </Badge>
            <span className="text-[#FF5E4A]/80">
              {formatDate(task.due_date)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
