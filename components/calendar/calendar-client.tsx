'use client'

import { useEffect, useState } from 'react'
import { CalendarView } from './calendar-view'
import { Task } from '@/lib/types'
import { Modal } from '@/components/ui/modal'
import { TaskForm } from '@/components/tasks/task-form'
<<<<<<< HEAD
=======
import { useToast } from '@/components/providers/toast-provider'
>>>>>>> codex-restore-ux

interface CalendarClientProps {
  initialTasks: Task[]
  projects: { id: string; title: string }[]
}

export function CalendarClient({ initialTasks, projects }: CalendarClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
<<<<<<< HEAD
=======
  const { toast } = useToast()
>>>>>>> codex-restore-ux

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const refreshTasks = async () => {
<<<<<<< HEAD
    const response = await fetch('/api/tasks')
    if (response.ok) {
      const data = await response.json()
      setTasks(data)
=======
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        const data = await response.json()
        toast({ title: 'Görevler yenilenemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        return
      }
      const data = (await response.json()) as Task[]
      setTasks(data)
    } catch (error) {
      toast({
        title: 'Görevler yenilenemedi',
        description: error instanceof Error ? error.message : 'Bir hata oluştu.',
        variant: 'error'
      })
>>>>>>> codex-restore-ux
    }
  }

  return (
    <div className="space-y-6">
      <CalendarView tasks={tasks} onCreateTask={() => setIsModalOpen(true)} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Takvime Görev Ekle">
        <TaskForm
          projects={projects}
<<<<<<< HEAD
          onSuccess={() => {
=======
          onSuccess={(_task) => {
>>>>>>> codex-restore-ux
            setIsModalOpen(false)
            refreshTasks()
          }}
        />
      </Modal>
    </div>
  )
}
