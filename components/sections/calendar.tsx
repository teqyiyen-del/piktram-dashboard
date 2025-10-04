'use client'

import { ReactNode, useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek
} from 'date-fns'
import { tr } from 'date-fns/locale'
import { AgendaEvent } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { ListItem } from './list-item'
import { cn } from '@/lib/utils'

const eventTypeConfig: Record<
  AgendaEvent['type'],
  { label: string; dot: string; tone: 'accent' | 'blue' | 'emerald' | 'amber' | 'violet' }
> = {
  icerik: { label: 'İçerik Yayını', dot: 'bg-accent', tone: 'accent' },
  toplanti: { label: 'Toplantı', dot: 'bg-blue-500', tone: 'blue' },
  odeme: { label: 'Ödeme Günü', dot: 'bg-amber-500', tone: 'amber' },
  rapor: { label: 'Rapor Teslimi', dot: 'bg-emerald-500', tone: 'emerald' }
}

const typeIcon: Record<AgendaEvent['type'], ReactNode> = {
  icerik: <span className="text-lg">🗓️</span>,
  toplanti: <span className="text-lg">🤝</span>,
  odeme: <span className="text-lg">💳</span>,
  rapor: <span className="text-lg">📊</span>
}

interface CalendarProps {
  events: AgendaEvent[]
  onCreateEvent?: (date: Date) => void
  onEditEvent?: (event: AgendaEvent) => void
  onDeleteEvent?: (event: AgendaEvent) => void
  pendingEventId?: string | null
}

export function Calendar({
  events,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  pendingEventId
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: tr })
    const end = endOfWeek(endOfMonth(currentDate), { locale: tr })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, AgendaEvent[]>>((acc, event) => {
      if (!event.date) return acc
      const d = new Date(event.date)
      if (isNaN(d.getTime())) return acc // 🔥 geçersiz tarihleri atla
      const key = format(d, 'yyyy-MM-dd')
      if (!acc[key]) acc[key] = []
      acc[key].push(event)
      return acc
    }, {})
  }, [events])

  const selectedKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
  const selectedEvents = selectedKey ? eventsByDate[selectedKey] ?? [] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
            Aylık Ajanda
          </p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'LLLL yyyy', { locale: tr })}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setCurrentDate(addMonths(currentDate, -1))}>
            Önceki
          </Button>
          <Button variant="secondary" onClick={() => setCurrentDate(new Date())}>
            Bugün
          </Button>
          <Button variant="secondary" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            Sonraki
          </Button>
        </div>
      </div>

      {/* Gün başlıkları */}
      <div className="grid grid-cols-7 gap-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Günler */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEvents = eventsByDate[key] ?? []
          const hasEvents = dayEvents.length > 0
          const isCurrentMonth = isSameMonth(day, currentDate)
          const today = isSameDay(day, new Date())

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(day)}
              className={cn(
                'flex h-28 flex-col rounded-2xl border p-3 text-left transition',
                isCurrentMonth
                  ? 'border-gray-200 bg-white/80 text-gray-800 shadow-sm dark:border-gray-700 dark:bg-surface-dark/70 dark:text-gray-200'
                  : 'border-dashed border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-600',
                hasEvents ? 'hover:border-accent hover:shadow-brand-sm' : 'cursor-default',
                today ? 'ring-2 ring-accent ring-offset-2 dark:ring-offset-surface-dark' : ''
              )}
            >
              <span className="text-sm font-semibold">
                {format(day, 'd', { locale: tr })}
              </span>
              <div className="mt-auto flex flex-wrap items-center gap-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <span
                    key={event.id}
                    className={cn('h-2.5 w-2.5 rounded-full', eventTypeConfig[event.type].dot)}
                    title={event.title}
                  ></span>
                ))}
                {dayEvents.length > 3 ? (
                  <span className="text-[10px] font-semibold text-gray-400">
                    +{dayEvents.length - 3}
                  </span>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        {Object.entries(eventTypeConfig).map(([type, config]) => (
          <div key={type} className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', config.dot)}></span>
            <span>{config.label}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr }) : ''}
        actions={
          onCreateEvent && selectedDate ? (
            <Button className="px-4 py-2 text-xs" onClick={() => onCreateEvent(selectedDate)}>
              Yeni Etkinlik Ekle
            </Button>
          ) : undefined
        }
      >
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bu tarih için planlanmış etkinlik bulunmuyor.{' '}
            {onCreateEvent ? 'Yeni bir etkinlik eklemek için yukarıdaki butonu kullanabilirsiniz.' : ''}
          </p>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((event) => {
              if (!event.date) return null
              const d = new Date(event.date)
              if (isNaN(d.getTime())) return null // geçersizse gösterme

              const metaLabel =
                d.getHours() === 0 && d.getMinutes() === 0
                  ? 'Tüm Gün Etkinlik'
                  : format(d, 'HH:mm', { locale: tr })

              return (
                <ListItem
                  key={event.id}
                  icon={typeIcon[event.type]}
                  title={event.title}
                  description={event.description ?? undefined}
                  meta={metaLabel}
                  tone={eventTypeConfig[event.type].tone}
                  tag={eventTypeConfig[event.type].label}
                  tagColor="accent"
                  compact
                  rightSlot={
                    <div className="flex items-center gap-2">
                      {onEditEvent ? (
                        <Button
                          variant="outline"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => onEditEvent(event)}
                        >
                          Düzenle
                        </Button>
                      ) : null}
                      {onDeleteEvent ? (
                        <Button
                          variant="ghost"
                          className="px-3 py-1.5 text-xs text-red-500 hover:text-red-600 dark:text-red-300 dark:hover:text-red-200"
                          onClick={() => onDeleteEvent(event)}
                          disabled={pendingEventId === event.id}
                        >
                          {pendingEventId === event.id ? 'Siliniyor...' : 'Sil'}
                        </Button>
                      ) : null}
                    </div>
                  }
                />
              )
            })}
          </div>
        )}
      </Modal>
    </div>
  )
}
