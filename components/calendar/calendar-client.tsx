'use client'

import { useEffect, useState, useMemo } from 'react'
import { CalendarView } from './calendar-view'
import { Task } from '@/lib/types'
import { Modal } from '@/components/ui/modal'
import { TaskForm } from '@/components/tasks/task-form'
import { useToast } from '@/components/providers/toast-provider'

// CalendarView'e geçecek event tipi
interface CalendarEvent {
  id: string
  title: string
  date: string
}

interface CalendarClientProps {
  initialTasks: Task[]
  projects: { id: string; title: string }[]
}

export function CalendarClient({ initialTasks, projects }: CalendarClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const refreshTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        const data = await response.json()
        toast({
          title: 'Görevler yenilenemedi',
          description: data.error ?? 'Bir hata oluştu.',
          variant: 'error',
        })
        return
      }
      const data = (await response.json()) as Task[]
      setTasks(data)
    } catch (error) {
      toast({
        title: 'Görevler yenilenemedi',
        description: error instanceof Error ? error.message : 'Bir hata oluştu.',
        variant: 'error',
      })
    }
  }

  // Taskleri calendar eventlerine map’le
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter((t) => t.due_date) // tarihi olanları al
      .map((t) => ({
        id: t.id,
        title: t.title,
        date: t.due_date as string,
      }))
  }, [tasks])

  return (
    <div className="space-y-6">
      <CalendarView
        events={calendarEvents} // artık due_date tarihleri gönderiyoruz
        onCreateTask={() => setIsModalOpen(true)}
      />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Takvime Görev Ekle">
        <TaskForm
          projects={projects}
          onSuccess={() => {
            setIsModalOpen(false)
            refreshTasks()
          }}
        />
      </Modal>
    </div>
  )
}
