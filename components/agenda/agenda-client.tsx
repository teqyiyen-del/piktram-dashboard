'use client'

import { useMemo, useState } from 'react'
import { Calendar } from '@/components/sections/calendar'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { SectionHeader } from '@/components/layout/section-header'
import type { AgendaEvent, Event as CalendarEvent } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Calendar as CalendarIcon } from 'lucide-react'

interface AgendaClientProps {
  initialEvents: CalendarEvent[]
}

export function AgendaClient({ initialEvents }: AgendaClientProps) {
  const [events] = useState<CalendarEvent[]>(initialEvents)

  // Takvim için mapleme
  const calendarEvents: AgendaEvent[] = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description ?? undefined,
      date: event.event_date,
      type: event.event_type,
      related: event.related ?? undefined,
    }))
  }, [events])

  // Yaklaşan etkinlikler
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return [...events]
      .filter((event) => new Date(event.event_date) >= now)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 6)
  }, [events])

  return (
    <div className="space-y-10 px-layout-x py-layout-y">
      {/* Header */}
      <SectionHeader
        title="Ajanda"
        subtitle="İçerik teslimleri, toplantılar ve finansal hatırlatmaları tek takvimde görüntüleyin."
        badge="Planlama"
        gradient
      />

      {/* Takvim */}
      <Card>
        <Calendar events={calendarEvents} />
      </Card>

      {/* Yaklaşan Etkinlikler */}
      <Card title="Yaklaşan Etkinlikler" description="Önümüzdeki günlerde hazırlanmanız gereken aksiyonlar.">
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ajandada yaklaşan etkinlik bulunmuyor. Yeni etkinlik eklediğinizde burada listelenecek.
            </p>
          ) : (
            upcomingEvents.map((event) => (
              <ListItem
                key={event.id}
                icon={
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                    <CalendarIcon className="h-4 w-4 text-white" />
                  </div>
                }
                title={event.title}
                description={event.description ?? undefined}
                meta={`${formatDate(event.event_date)}${event.related ? ` • ${event.related}` : ''}`}
                compact
              />
            ))
          )}
        </div>
      </Card>

      {/* Ajanda İpuçları */}
      <Card title="Ajanda İpuçları" description="Takvimi ekiple senkron tutmak için hatırlatmalar.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
            Supabase fonksiyonları ile ajandayı otomatik bildirimlere bağlayarak ekip arkadaşlarınıza hatırlatma gönderebilirsiniz.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
            Cal.com entegrasyonunu etkinleştirerek toplantıları doğrudan bu takvime aktarabilirsiniz.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
            Ödeme hatırlatmalarını Supabase Edge Functions üzerinden planlayarak müşterilerinizi zamanında bilgilendirin.
          </div>
        </div>
      </Card>
    </div>
  )
}
