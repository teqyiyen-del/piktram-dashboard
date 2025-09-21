'use client'

import { useEffect, useMemo, useState } from 'react'
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
  tasks: Task[]
  projects?: { id: string; title: string }[]
  onTaskMove?: (taskId: string, newStatus: string) => Promise<void> | void
  onRefresh?: () => Promise<void> | void
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

function KanbanBoard({ tasks, projects = [], onTaskMove, onRefresh }: KanbanBoardProps) {
  const [data, setData] = useState<Task[]>(
    (tasks ?? []).map(t => ({ ...t, status: normalizeStatus(t.status) }))
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { refresh: refreshNotifications } = useNotificationCenter()
  const { toast } = useToast()

  // dışarıdan gelen liste değiştiğinde senkronize et
  useEffect(() => {
    setData((tasks ?? []).map(t => ({ ...t, status: normalizeStatus(t.status) })))
  }, [JSON.stringify(tasks)])

  const groupedTasks = useMemo(() => {
    const base = {} as Record<ColumnKey, Task[]>
    TASK_STATUS_ORDER.forEach(status => {
      base[status] = []
    })

    data.forEach(task => {
      const normalized = normalizeStatus(task.status)
      if (!base[normalized]) base[normalized] = []
      base[normalized].push({ ...task, status: normalized })
    })
    return base
  }, [data])

  const handleDragEnd = async ({ destination, source, draggableId }: DropResult) => {
    if (!destination || destination.droppableId === source.droppableId) return
    const newStatus = destination.droppableId as ColumnKey
    const previous = structuredClone(data)

    setData(prev => prev.map(t => String(t.id) === draggableId ? { ...t, status: normalizeStatus(newStatus) } : t))
    try {
      await onTaskMove?.(draggableId, newStatus)
      toast({
        title: 'Durum güncellendi',
        description: `${getStatusLabel(newStatus)} aşamasına taşındı.`,
        variant: 'success'
      })
      await onRefresh?.()
      void refreshNotifications()
    } catch (e) {
      setData(previous)
      toast({ title: 'Durum güncellenemedi', variant: 'error' })
    }
  }

  const handleDelete = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast({
          title: 'Görev silinemedi',
          description: data.error ?? 'Bir hata oluştu.',
          variant: 'error'
        })
        return
      }
      setData(prev => prev.filter(t => t.id !== task.id))
      toast({ title: 'Görev silindi', variant: 'success' })
      await onRefresh?.()
    } catch (e) {
      toast({ title: 'Görev silinemedi', variant: 'error' })
    }
  }

  const handleInlineUpdate = async (taskId: string, payload: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast({
          title: 'Görev güncellenemedi',
          description: data.error ?? 'Bir hata oluştu.',
          variant: 'error'
        })
        return
      }
      const updated = (await res.json()) as Task
      setData(prev =>
        prev.map(t => String(t.id) === taskId ? { ...updated, status: normalizeStatus(updated.status) } : t)
      )
      toast({ title: 'Görev güncellendi', variant: 'success' })
      await onRefresh?.()
      void refreshNotifications()
    } catch (e) {
      toast({ title: 'Görev güncellenemedi', variant: 'error' })
    }
  }

  const handleOpenDetails = (task: Task) => {
    setSelectedTask({ ...task, status: normalizeStatus(task.status) })
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap">
          {TASK_STATUS_ORDER.map(column => (
            <Droppable droppableId={column} key={column}>
              {(provided, snapshot) => {
                const columnTasks = groupedTasks[column] ?? []
                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-w-[280px] flex-1 flex flex-col gap-4 rounded-2xl border bg-transparent p-5 shadow-sm transition-colors
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

                    {columnTasks.map((task, index) => {
                      const idStr = String(task.id)
                      return (
                        <Draggable draggableId={idStr} index={index} key={idStr}>
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
                      )
                    })}
                    {provided.placeholder}
                    {columnTasks.length === 0 && (
                      <p className="mt-auto text-center text-xs text-gray-400 dark:text-gray-600">
                        Bu sütunda görev yok.
                      </p>
                    )}
                  </div>
                )
              }}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null) }}
        title={editingTask ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
      >
        <TaskForm
          projects={projects}
          initialData={editingTask ?? undefined}
          onSuccess={async () => {
            setIsModalOpen(false)
            setEditingTask(null)
            await onRefresh?.()
          }}
        />
      </Modal>

      <Modal
        isOpen={isDetailsOpen && !!selectedTask}
        onClose={() => { setIsDetailsOpen(false); setSelectedTask(null) }}
        title="Görev Detayları"
      >
        {selectedTask && (
          <TaskDetails
            task={selectedTask}
            projects={projects}
            onClose={() => { setIsDetailsOpen(false); setSelectedTask(null) }}
            onTaskUpdated={async (updated) => {
              setData(prev =>
                prev.map(t => t.id === updated.id ? { ...updated, status: normalizeStatus(updated.status) } : t)
              )
              setSelectedTask(updated)
              await onRefresh?.()
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default KanbanBoard
