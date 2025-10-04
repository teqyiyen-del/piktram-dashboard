'use client'

import { useMemo, useState } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import { WorkflowItem, WorkflowStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface WorkflowBoardProps {
  items: WorkflowItem[]
}

const statusOrder: WorkflowStatus[] = ['yapiliyor', 'onay_surecinde', 'revize', 'onaylandi', 'paylasildi']

const statusLabels: Record<WorkflowStatus, string> = {
  yapiliyor: 'Yapılıyor',
  onay_surecinde: 'Onay Sürecinde',
  revize: 'Revize',
  onaylandi: 'Onaylandı',
  paylasildi: 'Paylaşıldı'
}

const statusStyles: Record<WorkflowStatus, string> = {
  yapiliyor: 'border-blue-100 bg-blue-50/80 dark:border-blue-500/30 dark:bg-blue-500/10',
  onay_surecinde: 'border-amber-100 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/10',
  revize: 'border-rose-100 bg-rose-50/80 dark:border-rose-500/30 dark:bg-rose-500/10',
  onaylandi: 'border-emerald-100 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-500/10',
  paylasildi: 'border-purple-100 bg-purple-50/80 dark:border-purple-500/30 dark:bg-purple-500/10'
}

export function WorkflowBoard({ items }: WorkflowBoardProps) {
  const [workItems, setWorkItems] = useState(items)
  const [notification, setNotification] = useState<string | null>(null)

  const grouped = useMemo(() => {
    return workItems.reduce<Record<WorkflowStatus, WorkflowItem[]>>((acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = []
      }
      acc[item.status].push(item)
      return acc
    }, {
      yapiliyor: [],
      onay_surecinde: [],
      revize: [],
      onaylandi: [],
      paylasildi: []
    })
  }, [workItems])

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return

    const destStatus = destination.droppableId as WorkflowStatus
    const sourceStatus = source.droppableId as WorkflowStatus

    if (destStatus === sourceStatus && destination.index === source.index) {
      return
    }

    const movedItem = workItems.find((item) => item.id === draggableId)
    if (!movedItem) return

    setWorkItems((prev) => prev.map((item) => (item.id === draggableId ? { ...item, status: destStatus } : item)))
    setNotification(
      `${movedItem.title} ${statusLabels[sourceStatus]} → ${statusLabels[destStatus]} durumuna taşındı. Bildirim sistemi yakında ekip arkadaşlarını bilgilendirecek.`
    )
  }

  return (
    <div className="space-y-5">
      <div
        className={cn(
          'rounded-3xl border p-5 text-sm transition-colors duration-300',
          notification
            ? 'border-accent/50 bg-accent/10 text-accent dark:border-accent/60 dark:bg-accent/15'
            : 'border-dashed border-gray-300 bg-white/70 text-gray-600 dark:border-gray-700 dark:bg-surface-dark/70 dark:text-gray-300'
        )}
      >
        {notification ?? 'Durum değişiklikleri burada gösterilecek. Bir kartı sürükleyerek bildirim ön izlemesini tetikleyin.'}
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-6 lg:grid-cols-5">
          {statusOrder.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'flex min-h-[420px] flex-col gap-4 rounded-3xl border bg-white/70 p-5 shadow-sm transition-all duration-300 dark:bg-surface-dark/80',
                    snapshot.isDraggingOver ? 'ring-2 ring-accent/40' : '',
                    statusStyles[status]
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300">
                      {statusLabels[status]}
                    </p>
                    <span className="pill bg-white/70 text-gray-500 dark:bg-surface-dark/70 dark:text-gray-300">
                      {grouped[status].length}
                    </span>
                  </div>
                  {grouped[status].map((item, index) => (
                    <Draggable draggableId={item.id} index={index} key={item.id}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className={cn(
                            'rounded-2xl border border-gray-200 bg-white/95 p-4 text-left shadow-sm transition-all duration-200 dark:border-gray-700 dark:bg-surface-dark',
                            dragSnapshot.isDragging ? 'rotate-1 shadow-lg ring-2 ring-accent/40' : ''
                          )}
                          style={dragProvided.draggableProps.style}
                        >
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.brand}</p>
                          {item.deadline ? (
                            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Teslim: {item.deadline}</p>
                          ) : null}
                          {item.owner ? (
                            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Sorumlu: {item.owner}</p>
                          ) : null}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {grouped[status].length === 0 ? (
                    <p className="mt-auto text-center text-xs text-gray-400 dark:text-gray-600">
                      Şimdilik kart bulunmuyor.
                    </p>
                  ) : null}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
