'use client'

import { useEffect, useState } from 'react'
import { CalendarView } from './calendar-view'
import { Task } from '@/lib/types'
import { Modal } from '@/components/ui/modal'
import { TaskForm } from '@/components/tasks/task-form'

interface CalendarClientProps {
  initialTasks: Task[]
  projects: { id: string; title: string }[]
}

export function CalendarClient({ initialTasks, projects }: CalendarClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const refreshTasks = async () => {
    const response = await fetch('/api/tasks')
    if (response.ok) {
      const data = await response.json()
      setTasks(data)
    }
  }

  return (
    <div className="space-y-6">
      <CalendarView tasks={tasks} onCreateTask={() => setIsModalOpen(true)} />
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
