'use client'

import { useMemo, useState } from 'react'
import { Calendar } from '@/components/sections/calendar'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { SectionHeader } from '@/components/layout/section-header'
import type { AgendaEvent } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Calendar as CalendarIcon } from 'lucide-react'

// Task tipinden gelen props
interface AgendaClientProps {
  initialEvents: {
    id: string
    title: string
    description?: string | null
    due_date: string
    status: string
  }[]
}

export function AgendaClient({ initialEvents }: AgendaClientProps) {
  const [events] = useState(initialEvents)

  // Takvim için mapleme
  const calendarEvents: AgendaEvent[] = useMemo(() => {
    return events.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      due_date: task.due_date, // 👈 due_date ile uyumlu
      type: 'task',
      related: task.status,
    }))
  }, [events])

  // Yaklaşan etkinlikler
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return [...events]
      .filter((task) => new Date(task.due_date) >= now)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 6)
  }, [events])

  return (
    <div className="space-y-10 px-layout-x py-layout-y">
      {/* Header */}
      <SectionHeader
        title="Ajanda"
        subtitle="İş akışı görevlerinizi, toplantılarınızı ve finansal hatırlatmaları tek takvimde görüntüleyin."
        badge="Planlama"
        gradient
      />

      {/* Takvim */}
      <Card>
        <Calendar events={calendarEvents} />
      </Card>

      {/* Yaklaşan Etkinlikler */}
      <Card title="Yaklaşan Görevler" description="Önümüzdeki günlerde hazırlanmanız gereken görevler.">
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ajandada yaklaşan görev bulunmuyor. Yeni görev eklediğinizde burada listelenecek.
            </p>
          ) : (
            upcomingEvents.map((task) => {
              const formattedDate = formatDate(task.due_date)
              // Ay ismini ayrı yakalayalım (örn. "21 Eylül 2025")
              const parts = formattedDate.split(' ')
              const day = parts[0]
              const month = parts[1]
              const year = parts[2]

              return (
                <ListItem
                  key={task.id}
                  icon={
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                      <CalendarIcon className="h-4 w-4 text-white" />
                    </div>
                  }
                  title={task.title}
                  description={task.description ?? undefined}
                  meta={
                    <span className="group cursor-pointer">
                      {day}{' '}
                      <span className="transition-colors group-hover:text-white">
                        {month}
                      </span>{' '}
                      {year}
                      {task.status ? ` • ${task.status}` : ''}
                    </span>
                  }
                  compact
                />
              )
            })
          )}
        </div>
      </Card>

      {/* Ajanda İpuçları */}
      <Card title="Ajanda İpuçları">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
            Görevlerin ne zaman biteceğini ajandanızdan kolayca takip edin.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
            Planlı toplantılarınızı ve rapor teslim tarihlerini tek ekranda görüntüleyin.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
            Aboneliğinizin yenileme tarihini ajandanızdan takip edin, sürpriz yaşamayın.
          </div>
        </div>
      </Card>
    </div>
  )
}
