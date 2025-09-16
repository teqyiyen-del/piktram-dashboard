'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar } from '@/components/sections/calendar'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { Modal } from '@/components/ui/modal'
import { EventForm } from '@/components/agenda/event-form'
import type { AgendaEvent, Event as CalendarEvent } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface AgendaClientProps {
  initialEvents: CalendarEvent[]
}

type FormState =
  | { mode: 'create'; defaultDate?: Date }
  | { mode: 'edit'; event: CalendarEvent }
  | null

export function AgendaClient({ initialEvents }: AgendaClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [formState, setFormState] = useState<FormState>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const calendarEvents: AgendaEvent[] = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description ?? undefined,
      date: event.event_date,
      type: event.event_type,
      related: event.related ?? undefined
    }))
  }, [events])

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return [...events]
      .filter((event) => new Date(event.event_date) >= now)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 6)
  }, [events])

  const handleCreateRequest = (date: Date) => {
    setFormState({ mode: 'create', defaultDate: date })
  }

  const handleEditRequest = (agendaEvent: AgendaEvent) => {
    const event = events.find((item) => item.id === agendaEvent.id)
    if (event) {
      setFormState({ mode: 'edit', event })
    }
  }

  const handleDelete = async (agendaEvent: AgendaEvent) => {
    setPendingDeleteId(agendaEvent.id)
    try {
      const response = await fetch(`/api/events/${agendaEvent.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? 'Etkinlik silinemedi')
      }
      setEvents((prev) => prev.filter((event) => event.id !== agendaEvent.id))
      setToast({ type: 'success', message: 'Etkinlik silindi' })
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Etkinlik silinemedi' })
    } finally {
      setPendingDeleteId(null)
    }
  }

  const handleFormSuccess = (savedEvent: CalendarEvent, message: string) => {
    setFormState(null)
    setEvents((prev) => {
      const exists = prev.some((event) => event.id === savedEvent.id)
      if (exists) {
        return prev.map((event) => (event.id === savedEvent.id ? savedEvent : event))
      }
      return [...prev, savedEvent]
    })
    setToast({ type: 'success', message })
  }

  return (
    <div className="space-y-8">
      {toast ? (
        <div
          className={`fixed right-6 top-24 z-40 min-w-[260px] rounded-2xl px-4 py-3 text-sm shadow-lg transition ${
            toast.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'border border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <Card
        title="Ajanda"
        description="İçerik teslimleri, toplantılar ve finansal hatırlatmaları tek takvimde yönetin."
      >
        <Calendar
          events={calendarEvents}
          onCreateEvent={handleCreateRequest}
          onEditEvent={handleEditRequest}
          onDeleteEvent={handleDelete}
          pendingEventId={pendingDeleteId}
        />
      </Card>

      <Card
        title="Yaklaşan Etkinlikler"
        description="Önümüzdeki günlerde hazırlanmanız gereken aksiyonlar."
      >
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ajandada yaklaşan etkinlik bulunmuyor. Yeni etkinlik eklediğinizde burada listelenecek.
            </p>
          ) : (
            upcomingEvents.map((event) => (
              <ListItem
                key={event.id}
                icon={<span className="text-lg">🗓️</span>}
                title={event.title}
                description={event.description ?? undefined}
                meta={`${formatDate(event.event_date)}${event.related ? ` • ${event.related}` : ''}`}
                tag={event.event_type === 'icerik' ? 'İçerik' : event.event_type === 'toplanti' ? 'Toplantı' : event.event_type === 'odeme' ? 'Ödeme' : 'Rapor'}
                tagColor="info"
                tone={event.event_type === 'rapor' ? 'emerald' : event.event_type === 'odeme' ? 'amber' : event.event_type === 'toplanti' ? 'blue' : 'accent'}
                compact
              />
            ))
          )}
        </div>
      </Card>

      <Card
        title="Ajanda İpuçları"
        description="Takvimi ekiple senkron tutmak için hatırlatmalar."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Supabase fonksiyonları ile ajandayı otomatik bildirimlere bağlayarak ekip arkadaşlarınıza hatırlatma gönderebilirsiniz.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Cal.com entegrasyonunu etkinleştirerek toplantıları doğrudan bu takvime aktarabilirsiniz.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Ödeme hatırlatmalarını Supabase Edge Functions üzerinden planlayarak müşterilerinizi zamanında bilgilendirin.
          </div>
        </div>
      </Card>

      <Modal
        isOpen={formState !== null}
        onClose={() => setFormState(null)}
        title={formState?.mode === 'edit' ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Oluştur'}
      >
        {formState ? (
          <EventForm
            initialData={formState.mode === 'edit' ? formState.event : undefined}
            defaultDate={formState.mode === 'create' ? formState.defaultDate : undefined}
            onSuccess={handleFormSuccess}
          />
        ) : null}
      </Modal>
    </div>
  )
}
