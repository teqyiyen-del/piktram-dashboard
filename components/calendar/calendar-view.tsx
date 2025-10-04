'use client'

import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek
} from 'date-fns'
import { tr } from 'date-fns/locale'
import { Task } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { formatDate } from '@/lib/utils'

interface CalendarViewProps {
  tasks: Task[]
  onCreateTask: () => void
}

export function CalendarView({ tasks, onCreateTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: tr })
    const end = endOfWeek(endOfMonth(currentDate), { locale: tr })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  // 🔥 Sadece due_date + onaylandı olanları al
  const tasksByDate = useMemo(() => {
    return tasks.reduce<Record<string, Task[]>>((acc, task) => {
      if (!task.due_date) return acc
      if (task.status !== 'approved') return acc
      const key = format(new Date(task.due_date), 'yyyy-MM-dd')
      if (!acc[key]) acc[key] = []
      acc[key].push(task)
      return acc
    }, {})
  }, [tasks])

  const selectedTasks = selectedDate
    ? tasksByDate[format(selectedDate, 'yyyy-MM-dd')] ?? []
    : []

  return (
    <div className="space-y-4">
      {/* Üst bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Takvim</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Onaylanan görevlerinizi aylık görünümde takip edin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setCurrentDate(addMonths(currentDate, -1))}>
            Önceki
          </Button>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow">
            {format(currentDate, 'LLLL yyyy', { locale: tr })}
          </div>
          <Button variant="secondary" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            Sonraki
          </Button>
          <Button onClick={onCreateTask}>Takvime Görev Ekle</Button>
        </div>
      </div>

      {/* Gün başlıkları */}
      <div className="grid grid-cols-7 gap-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Günler */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayTasks = tasksByDate[key] ?? []
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, new Date())

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(day)}
              className={`
                flex h-24 flex-col rounded-2xl border p-2 text-left transition-colors
                ${isCurrentMonth
                  ? 'bg-surface border-gray-200 text-gray-700 dark:border-gray-700 dark:bg-surface-dark dark:text-gray-200'
                  : 'bg-gray-50 border-gray-100 text-gray-400 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-600'}
                ${isToday ? 'ring-2 ring-accent' : ''}
                hover:bg-accent hover:text-white
              `}
            >
              {/* Gün numarası */}
              <span
                className={`
                  text-sm font-semibold transition-colors
                  ${dayTasks.length > 0 ? 'bg-accent text-white rounded-full px-2' : ''}
                `}
              >
                {format(day, 'd', { locale: tr })}
              </span>

              {/* Görev nokta göstergeleri */}
              <span className="mt-auto flex flex-wrap gap-1">
                {dayTasks.map((task) => (
                  <span key={task.id} className="h-1.5 w-1.5 rounded-full bg-accent"></span>
                ))}
              </span>
            </button>
          )
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: tr }) : 'Görevler'}
      >
        {selectedTasks.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bu tarih için onaylanmış görev bulunmuyor.
          </p>
        ) : (
          <div className="space-y-3">
            {selectedTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-gray-200 p-3 dark:border-gray-700"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{task.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{task.description}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Bitiş: {formatDate(task.due_date)}
                </p>
                {task.attachment_url && (
                  <a
                    href={task.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent"
                  >
                    📎 Ek dosyayı aç
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
