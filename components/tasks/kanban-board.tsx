'use client'

import { useEffect, useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Task } from '@/lib/types'
import { TaskCard } from './task-card'
import { Modal } from '@/components/ui/modal'
import { TaskForm } from './task-form'
import { Button } from '@/components/ui/button'
import { normalizeStatus, TASK_STATUS_ORDER, getStatusLabel } from '@/lib/task-status'
import { TaskDetails } from './task-details'
import { useToast } from '@/components/providers/toast-provider'

interface KanbanBoardProps {
  initialTasks: Task[]
  projects: { id: string; title: string }[]
}

type ColumnKey = (typeof TASK_STATUS_ORDER)[number]

const columnTitles: Record<ColumnKey, string> = TASK_STATUS_ORDER.reduce(
  (acc, status) => {
    acc[status] = getStatusLabel(status)
    return acc
  },
  {} as Record<ColumnKey, string>
)

export function KanbanBoard({ initialTasks, projects }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(() =>
    initialTasks.map((task) => ({ ...task, status: normalizeStatus(task.status) }))
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { toast } = useToast()

  const groupedTasks = useMemo(() => {
    const initial = TASK_STATUS_ORDER.reduce(
      (acc, status) => {
        acc[status] = [] as Task[]
        return acc
      },
      {} as Record<ColumnKey, Task[]>
    )
    tasks.forEach((task) => {
      const normalized = normalizeStatus(task.status)
      initial[normalized].push({ ...task, status: normalized })
    })
    return initial
  }, [tasks])

  const refreshTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        const data = await response.json()
        toast({ title: 'Görevler yenilenemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        return
      }
      const data = (await response.json()) as Task[]
      setTasks(data.map((task) => ({ ...task, status: normalizeStatus(task.status) })))
      if (selectedTask) {
        const updated = data.find((item) => item.id === selectedTask.id)
        if (updated) {
          setSelectedTask({ ...updated, status: normalizeStatus(updated.status) })
        }
      }
    } catch (error) {
      toast({
        title: 'Görevler yenilenemedi',
        description: error instanceof Error ? error.message : 'Bir hata oluştu.',
        variant: 'error'
      })
    }
  }

  useEffect(() => {
    setTasks(initialTasks.map((task) => ({ ...task, status: normalizeStatus(task.status) })))
  }, [initialTasks])

  const handleDragEnd = async ({ destination, source, draggableId }: DropResult) => {
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const newStatus = destination.droppableId as ColumnKey
    const previous = tasks
    setTasks((prev) =>
      prev.map((task) => (task.id === draggableId ? { ...task, status: normalizeStatus(newStatus) } : task))
    )

    try {
      const response = await fetch(`/api/tasks/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const data = await response.json()
        toast({ title: 'Durum güncellenemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        setTasks(previous)
        return
      }

      toast({
        title: 'Durum güncellendi',
        description: `${getStatusLabel(newStatus)} aşamasına taşındı.`,
        variant: 'success'
      })
      refreshTasks()
    } catch (error) {
      toast({
        title: 'Durum güncellenemedi',
        description: error instanceof Error ? error.message : 'Bir hata oluştu.',
        variant: 'error'
      })
      setTasks(previous)
    }
  }

  const handleDelete = async (task: Task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        toast({ title: 'Görev silinemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        return
      }
      toast({ title: 'Görev silindi', description: 'Görev panodan kaldırıldı.', variant: 'success' })
      refreshTasks()
    } catch (error) {
      toast({
        title: 'Görev silinemedi',
        description: error instanceof Error ? error.message : 'Bir hata oluştu.',
        variant: 'error'
      })
    }
  }

  const handleOpenDetails = (task: Task) => {
    const normalizedTask = { ...task, status: normalizeStatus(task.status) }
    setSelectedTask(normalizedTask)
    setIsDetailsOpen(true)
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setSelectedTask(updatedTask)
    refreshTasks()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Görev Panosu</h2>
        <Button onClick={() => setIsModalOpen(true)}>+ Görev Ekle</Button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.keys(columnTitles) as ColumnKey[]).map((column) => (
            <Droppable droppableId={column} key={column}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex min-h-[400px] flex-col gap-4 rounded-2xl bg-gray-100 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{columnTitles[column]}</h3>
                    <span className="text-xs text-gray-500">{groupedTasks[column].length} görev</span>
                  </div>
                  {groupedTasks[column].map((task, index) => (
                    <Draggable draggableId={task.id} index={index} key={task.id}>
                      {(dragProvided) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                        >
                          <TaskCard task={task} onDelete={handleDelete} onOpen={handleOpenDetails} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Görev Oluştur">
        <TaskForm
          projects={projects}
          onSuccess={(createdTask) => {
            setIsModalOpen(false)
            setTasks((prev) => [...prev, { ...createdTask, status: normalizeStatus(createdTask.status) }])
            refreshTasks()
          }}
        />
      </Modal>

      <Modal
        isOpen={isDetailsOpen && !!selectedTask}
        onClose={() => {
          setIsDetailsOpen(false)
          setSelectedTask(null)
        }}
        title="Görev Detayları"
      >
        {selectedTask && (
          <TaskDetails
            task={selectedTask}
            projects={projects}
            onClose={() => {
              setIsDetailsOpen(false)
              setSelectedTask(null)
            }}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
      </Modal>
    </div>
  )
}
