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
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [boardMessage, setBoardMessage] = useState<string | null>(null)

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
      setBoardMessage(null)
    }
  }

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const handleDragEnd = async ({ destination, source, draggableId }: DropResult) => {
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId as ColumnKey

    setTasks((prev) => {
      const updated = prev.map((task) => (task.id === draggableId ? { ...task, status: newStatus } : task))
      return updated
    })

    const response = await fetch(`/api/tasks/${draggableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })

    if (!response.ok) {
      setBoardMessage('Görev durumu güncellenemedi')
      refreshTasks()
      return
    }

    const updatedTask = await response.json()
    setTasks((prev) => prev.map((task) => (task.id === draggableId ? { ...task, ...updatedTask } : task)))
  }

  const handleDelete = async (task: Task) => {
    await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
    refreshTasks()
  }

  const handleInlineUpdate = async (taskId: string, payload: Partial<Task>) => {
    setBoardMessage(null)
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setBoardMessage(data.error ?? 'Görev güncellenemedi')
      return
    }

    const updated = await response.json()
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updated } : task)))
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Görev Panosu</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Görevleri sürükleyerek durumunu anında güncelleyin.</p>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null)
            setIsModalOpen(true)
          }}
        >
          + Görev Ekle
        </Button>
      </div>
      {boardMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {boardMessage}
        </div>
      )}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.keys(columnTitles) as ColumnKey[]).map((column) => (
            <Droppable droppableId={column} key={column}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex min-h-[420px] flex-col gap-4 rounded-3xl border border-gray-100 bg-white/70 p-5 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark/80 ${
                    snapshot.isDraggingOver ? 'ring-2 ring-accent/40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-300">
                      {columnTitles[column]}
                    </h3>
                    <span className="pill text-gray-500 dark:text-gray-400">{groupedTasks[column].length} görev</span>
                  </div>
                  {groupedTasks[column].map((task, index) => (
                    <Draggable draggableId={task.id} index={index} key={task.id}>
                      {(dragProvided, dragSnapshot) => {
                        const style = {
                          ...dragProvided.draggableProps.style,
                          transition: dragSnapshot.isDragging
                            ? 'transform 0.18s ease, box-shadow 0.18s ease'
                            : 'transform 0.35s ease',
                          boxShadow: dragSnapshot.isDragging ? '0 24px 30px -18px rgba(17, 24, 39, 0.35)' : undefined
                        }
                        return (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            style={style}
                            className={dragSnapshot.isDragging ? 'rotate-1' : ''}
                          >
                            <TaskCard
                              task={task}
                              onDelete={handleDelete}
                              onUpdate={handleInlineUpdate}
                              onEdit={(selected) => {
                                setEditingTask(selected)
                                setIsModalOpen(true)
                              }}
                            />
                          </div>
                        )
                      }}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTask ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
      >
        <TaskForm
          projects={projects}
          initialData={editingTask ?? undefined}
          onSuccess={() => {
            closeModal()
            refreshTasks()
          }}
        />
      </Modal>
    </div>
  )
}
