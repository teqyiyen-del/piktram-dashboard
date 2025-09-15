'use client'

import { useEffect, useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Task } from '@/lib/types'
import { TaskCard } from './task-card'
import { Modal } from '@/components/ui/modal'
import { TaskForm } from './task-form'
import { Button } from '@/components/ui/button'

interface KanbanBoardProps {
  initialTasks: Task[]
  projects: { id: string; title: string }[]
}

type ColumnKey = 'todo' | 'in_progress' | 'done'

const columnTitles: Record<ColumnKey, string> = {
  todo: 'Yapılacaklar',
  in_progress: 'Devam Edenler',
  done: 'Tamamlanan'
}

export function KanbanBoard({ initialTasks, projects }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const groupedTasks = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        acc[task.status].push(task)
        return acc
      },
      {
        todo: [] as Task[],
        in_progress: [] as Task[],
        done: [] as Task[]
      }
    )
  }, [tasks])

  const refreshTasks = async () => {
    const response = await fetch('/api/tasks')
    if (response.ok) {
      const data = await response.json()
      setTasks(data)
    }
  }

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const handleDragEnd = async ({ destination, source, draggableId }: DropResult) => {
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const newStatus = destination.droppableId as ColumnKey
    setTasks((prev) => prev.map((task) => (task.id === draggableId ? { ...task, status: newStatus } : task)))

    await fetch(`/api/tasks/${draggableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    refreshTasks()
  }

  const handleDelete = async (task: Task) => {
    await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
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
                          <TaskCard task={task} onDelete={handleDelete} />
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
          onSuccess={() => {
            setIsModalOpen(false)
            refreshTasks()
          }}
        />
      </Modal>
    </div>
  )
}
