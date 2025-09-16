'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Task, TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_ORDER } from '@/lib/types'
import { TaskCard } from './task-card'
import { Modal } from '@/components/ui/modal'
import { TaskForm } from './task-form'
import { Button } from '@/components/ui/button'
import { useNotificationCenter } from '@/components/providers/notification-provider'

interface KanbanBoardProps {
  initialTasks: Task[]
  projects: { id: string; title: string }[]
}

const columnStyles: Record<TaskStatus, string> = {
  yapiliyor: 'border-blue-100 bg-blue-50/80 dark:border-blue-500/30 dark:bg-blue-500/10',
  onay_surecinde: 'border-amber-100 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/10',
  revize: 'border-rose-100 bg-rose-50/80 dark:border-rose-500/30 dark:bg-rose-500/10',
  onaylandi: 'border-emerald-100 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-500/10',
  paylasildi: 'border-purple-100 bg-purple-50/80 dark:border-purple-500/30 dark:bg-purple-500/10'
}

export function KanbanBoard({ initialTasks, projects }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const { refresh: refreshNotifications } = useNotificationCenter()

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const groupedTasks = useMemo(() => {
    const base: Record<TaskStatus, Task[]> = {
      yapiliyor: [],
      onay_surecinde: [],
      revize: [],
      onaylandi: [],
      paylasildi: []
    }
    tasks.forEach((task) => {
      base[task.status].push(task)
    })
    return base
  }, [tasks])

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
  }, [])

  const refreshTasks = useCallback(async () => {
    const response = await fetch('/api/tasks')
    if (response.ok) {
      const data = await response.json()
      setTasks(data)
    }
  }, [])

  const handleDragEnd = async ({ destination, source, draggableId }: DropResult) => {
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId as TaskStatus
    const previousTasks = tasks
    const movedTask = tasks.find((task) => task.id === draggableId)
    if (!movedTask || movedTask.status === newStatus) return

    setTasks((prev) => prev.map((task) => (task.id === draggableId ? { ...task, status: newStatus } : task)))

    const response = await fetch(`/api/tasks/${draggableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })

    if (!response.ok) {
      setTasks(previousTasks)
      showToast('error', 'Görev durumu güncellenemedi')
      await refreshTasks()
      return
    }

    const updatedTask = await response.json()
    setTasks((prev) => prev.map((task) => (task.id === draggableId ? { ...task, ...updatedTask } : task)))
    showToast('success', `${movedTask.title} ${TASK_STATUS_LABELS[movedTask.status]} → ${TASK_STATUS_LABELS[newStatus]} durumuna taşındı`)
    void refreshNotifications()
  }

  const handleDelete = async (task: Task) => {
    const response = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
    if (!response.ok) {
      showToast('error', 'Görev silinemedi')
      return
    }
    await refreshTasks()
    showToast('success', 'Görev başarıyla silindi')
  }

  const handleInlineUpdate = async (taskId: string, payload: Partial<Task>) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      showToast('error', data.error ?? 'Görev güncellenemedi')
      return
    }

    const updated = await response.json()
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updated } : task)))
    if (payload.status) {
      showToast('success', `Durum ${TASK_STATUS_LABELS[payload.status as TaskStatus]} olarak güncellendi`)
      void refreshNotifications()
    } else {
      showToast('success', 'Görev güncellendi')
    }
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await handleInlineUpdate(taskId, { status })
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  return (
    <div className="space-y-4">
      {toast ? (
        <div
          className={`fixed right-6 top-24 z-50 min-w-[260px] rounded-2xl px-4 py-3 text-sm shadow-lg transition ${
            toast.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'border border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
          }`}
        >
          {toast.message}
        </div>
      ) : null}
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
          Yeni Görev Ekle
        </Button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-6 lg:grid-cols-5">
          {TASK_STATUS_ORDER.map((column) => (
            <Droppable droppableId={column} key={column}>
              {(provided, snapshot) => {
                const columnTasks = groupedTasks[column] ?? []
                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex min-h-[420px] flex-col gap-4 rounded-3xl border bg-white/80 p-5 shadow-sm transition-colors duration-300 dark:bg-surface-dark/80 ${
                      snapshot.isDraggingOver ? 'ring-2 ring-accent/40' : ''
                    } ${columnStyles[column]}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300">
                        {TASK_STATUS_LABELS[column]}
                      </h3>
                      <span className="pill bg-white/70 text-gray-500 dark:bg-surface-dark/70 dark:text-gray-300">
                        {columnTasks.length} görev
                      </span>
                    </div>
                    {columnTasks.map((task, index) => (
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
                                onStatusChange={handleStatusChange}
                              />
                            </div>
                          )
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {columnTasks.length === 0 ? (
                      <p className="mt-auto text-center text-xs text-gray-400 dark:text-gray-600">
                        Bu sütunda görev bulunmuyor.
                      </p>
                    ) : null}
                  </div>
                )
              }}
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
          onSuccess={(message) => {
            closeModal()
            refreshTasks()
            showToast('success', message ?? 'Görev kaydedildi')
          }}
        />
      </Modal>
    </div>
  )
}
