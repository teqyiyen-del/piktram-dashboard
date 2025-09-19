'use client'

import { useMemo, useState } from 'react'
import { Calendar } from '@/components/sections/calendar'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import type { AgendaEvent, Event as CalendarEvent } from '@/lib/types'
import { formatDate } from '@/lib/utils'

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
      related: event.related ?? undefined
    }))
  }, [events])

  // Yaklaşan etkinlikler (bugünden sonrası, en fazla 6 tane)
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return [...events]
      .filter((event) => new Date(event.event_date) >= now)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 6)
  }, [events])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-12">
      {/* Header */}
      <header
        className="rounded-2xl p-6 text-white shadow-sm"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <h1 className="text-xl md:text-2xl font-semibold">Ajanda</h1>
        <p className="mt-1 text-sm text-white/90">
          İçerik teslimleri, toplantılar ve finansal hatırlatmaları tek takvimde görüntüleyin.
        </p>
      </header>

      {/* Takvim */}
      <Card>
        <Calendar events={calendarEvents} />
      </Card>

      {/* Yaklaşan Etkinlikler */}
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
                tag={
                  event.event_type === 'icerik'
                    ? 'İçerik'
                    : event.event_type === 'toplanti'
                    ? 'Toplantı'
                    : event.event_type === 'odeme'
                    ? 'Ödeme'
                    : 'Rapor'
                }
                tagColor="info"
                tone={
                  event.event_type === 'rapor'
                    ? 'emerald'
                    : event.event_type === 'odeme'
                    ? 'amber'
                    : event.event_type === 'toplanti'
                    ? 'blue'
                    : 'accent'
                }
                compact
              />
            ))
          )}
        </div>
      </Card>

      {/* Ajanda İpuçları */}
      <Card
        title="Ajanda İpuçları"
        description="Takvimi ekiple senkron tutmak için hatırlatmalar."
      >
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
