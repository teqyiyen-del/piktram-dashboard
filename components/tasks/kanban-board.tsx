'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Task, TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_ORDER } from '@/lib/types'
import TaskCard from './task-card'
import { Modal } from '@/components/ui/modal'
import TaskForm from './task-form'
import { useNotificationCenter } from '@/components/providers/notification-provider'
import { normalizeStatus, getStatusLabel } from '@/lib/task-status'
import TaskDetails from './task-details'
import { useToast } from '@/components/providers/toast-provider'

interface KanbanBoardProps {
  initialTasks?: Task[]
  projects?: { id: string; title: string }[]
}

type ColumnKey = (typeof TASK_STATUS_ORDER)[number]

const columnStyles: Record<TaskStatus, string> = {
  yapiliyor: 'border-blue-500 bg-transparent dark:border-blue-400',
  onay_surecinde: 'border-amber-500 bg-transparent dark:border-amber-400',
  revize: 'border-rose-500 bg-transparent dark:border-rose-400',
  onaylandi: 'border-emerald-500 bg-transparent dark:border-emerald-400',
  paylasildi: 'border-purple-500 bg-transparent dark:border-purple-400',
  todo: 'border-gray-400 bg-transparent dark:border-gray-600',
  in_progress: 'border-blue-500 bg-transparent dark:border-blue-400',
  in_review: 'border-amber-500 bg-transparent dark:border-amber-400',
  revision: 'border-rose-500 bg-transparent dark:border-rose-400',
  approved: 'border-emerald-500 bg-transparent dark:border-emerald-400',
  published: 'border-purple-500 bg-transparent dark:border-purple-400',
  tamamlandi: 'border-gray-500 bg-transparent dark:border-gray-600'
}

function KanbanBoard({ initialTasks = [], projects = [] }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(() =>
    (initialTasks ?? []).map((task) => ({ ...task, status: normalizeStatus(task.status) }))
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { refresh: refreshNotifications } = useNotificationCenter()
  const { toast } = useToast()

  const groupedTasks = useMemo(() => {
    const base = TASK_STATUS_ORDER.reduce(
      (acc, status) => {
        acc[status] = [] as Task[]
        return acc
      },
      {} as Record<ColumnKey, Task[]>
    )
    tasks.forEach((task) => {
      const normalized = normalizeStatus(task.status)
      base[normalized].push({ ...task, status: normalized })
    })
    return base
  }, [tasks])

  const refreshTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        const data = await response.json()
        toast({
          title: 'Görevler yenilenemedi',
          description: data.error ?? 'Bir hata oluştu.',
          variant: 'error'
        })
        return
      }
      const data = (await response.json()) as Task[]
      setTasks((data ?? []).map((task) => ({ ...task, status: normalizeStatus(task.status) })))

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
  }, [toast, selectedTask])

  useEffect(() => {
    setTasks((initialTasks ?? []).map((task) => ({ ...task, status: normalizeStatus(task.status) })))
  }, [initialTasks])

  const handleDragEnd = async ({ destination, source, draggableId }: DropResult) => {
    if (!destination || destination.droppableId === source.droppableId) return

    const newStatus = destination.droppableId as ColumnKey
    const previous = structuredClone(tasks)

    setTasks((prev) =>
      prev.map((task) =>
        task.id === draggableId ? { ...task, status: normalizeStatus(newStatus) } : task
      )
    )

    try {
      const response = await fetch(`/api/tasks/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: 'Durum güncellenemedi',
          description: data.error ?? 'Bir hata oluştu.',
          variant: 'error'
        })
        setTasks(previous)
        return
      }

      toast({
        title: 'Durum güncellendi',
        description: `${getStatusLabel(newStatus)} aşamasına taşındı.`,
        variant: 'success'
      })
      refreshTasks()
      void refreshNotifications()
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
        toast({
          title: 'Görev silinemedi',
          description: data.error ?? 'Bir hata oluştu.',
          variant: 'error'
        })
        return
      }
      toast({ title: 'Görev silindi', description: 'Görev başarıyla kaldırıldı.', variant: 'success' })
      refreshTasks()
    } catch (error) {
      toast({
        title: 'Görev silinemedi',
        description: error instanceof Error ? error.message : 'Bir hata oluştu.',
        variant: 'error'
      })
    }
  }

  const handleInlineUpdate = async (taskId: string, payload: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        toast({
          title: 'Görev güncellenemedi',
          description: data.error ?? 'Bir hata oluştu.',
          variant: 'error'
        })
        return
      }

      const updated = (await response.json()) as Task
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updated : task)))
      toast({ title: 'Görev güncellendi', description: 'Değişiklikler kaydedildi.', variant: 'success' })
      void refreshNotifications()
    } catch (error) {
      toast({
        title: 'Görev güncellenemedi',
        description: error instanceof Error ? error.message : 'Bir hata oluştu.',
        variant: 'error'
      })
    }
  }

  const handleOpenDetails = (task: Task) => {
    setSelectedTask({ ...task, status: normalizeStatus(task.status) })
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Görev Panosu</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Görevleri sürükleyerek durumunu anında güncelleyin.
          </p>
        </div>
        {/* ✅ Yeni Görev butonu kaldırıldı */}
      </div>

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-wrap gap-6">
          {TASK_STATUS_ORDER.map((column) => (
            <Droppable droppableId={column} key={column}>
              {(provided, snapshot) => {
                const columnTasks = groupedTasks[column] ?? []
                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-w-[310px] flex-1 flex flex-col gap-4 rounded-2xl border bg-transparent p-5 shadow-sm transition-colors duration-300
                      ${snapshot.isDraggingOver ? 'ring-2 ring-accent/40' : ''} ${columnStyles[column]}`}
                    style={{ minHeight: '280px' }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200 truncate">
                        {TASK_STATUS_LABELS[column]}
                      </h3>
                      <span className="pill bg-white/90 text-gray-600 dark:bg-surface-dark/70 dark:text-gray-200">
                        {columnTasks.length} görev
                      </span>
                    </div>
                    {columnTasks.map((task, index) => (
                      <Draggable draggableId={task.id} index={index} key={task.id}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            style={{
                              ...dragProvided.draggableProps.style,
                              transition: dragSnapshot.isDragging
                                ? 'transform 0.18s ease, box-shadow 0.18s ease'
                                : 'transform 0.35s ease',
                              boxShadow: dragSnapshot.isDragging
                                ? '0 24px 30px -18px rgba(17, 24, 39, 0.35)'
                                : undefined
                            }}
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
                              onOpenDetails={handleOpenDetails}
                              onStatusChange={async (id, status) =>
                                handleInlineUpdate(id, { status: normalizeStatus(status) })
                              }
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {columnTasks.length === 0 && (
                      <p className="mt-auto text-center text-xs text-gray-400 dark:text-gray-600">
                        Bu sütunda görev bulunmuyor.
                      </p>
                    )}
                  </div>
                )
              }}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Görev Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        title={editingTask ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
      >
        <TaskForm
          projects={projects}
          initialData={editingTask ?? undefined}
          onSuccess={() => {
            setIsModalOpen(false)
            setEditingTask(null)
            refreshTasks()
          }}
        />
      </Modal>

      {/* Görev Detayları Modal */}
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
            onTaskUpdated={(updated) => {
              setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
              setSelectedTask(updated)
              refreshTasks()
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default KanbanBoard
