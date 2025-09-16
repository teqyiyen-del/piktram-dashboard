import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { Calendar } from '@/components/sections/calendar'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { AgendaEvent, Project, Task } from '@/lib/types'
import { addDays } from 'date-fns'
import { formatDate } from '@/lib/utils'

const eventTypeMeta: Record<AgendaEvent['type'], { label: string; tone: 'accent' | 'blue' | 'emerald' | 'amber' | 'violet'; tagColor: 'accent' | 'info' | 'warning' | 'success' }> = {
  icerik: { label: 'İçerik Yayını', tone: 'accent', tagColor: 'accent' },
  toplanti: { label: 'Toplantı', tone: 'blue', tagColor: 'info' },
  odeme: { label: 'Ödeme', tone: 'amber', tagColor: 'warning' },
  rapor: { label: 'Rapor', tone: 'emerald', tagColor: 'success' }
}

export default async function AjandaPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const tasksQuery = supabase
    .from('tasks')
    .select('id, title, description, due_date, project_id, user_id')
    .order('due_date', { ascending: true })

  const projectsQuery = supabase.from('projects').select('id, title, user_id')

  if (!isAdmin) {
    tasksQuery.eq('user_id', session.user.id)
    projectsQuery.eq('user_id', session.user.id)
  }

  const [{ data: tasksData }, { data: projectsData }] = await Promise.all([tasksQuery, projectsQuery])

  const projectMap = new Map(((projectsData ?? []) as Project[]).map((project) => [project.id, project.title]))

  const taskEvents: AgendaEvent[] = ((tasksData ?? []) as Task[])
    .filter((task) => !!task.due_date)
    .map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      description: task.description ?? undefined,
      date: task.due_date!,
      type: 'icerik',
      related: projectMap.get(task.project_id ?? '') ?? undefined
    }))

  const today = new Date()

  const staticEvents: AgendaEvent[] = [
    {
      id: 'meeting-1',
      title: 'Aylık Strateji Toplantısı',
      description: 'Marketing ekibi ile Zoom üzerinden. Notlar Supabase dosya deposuna aktarılacak.',
      date: addDays(today, 3).toISOString(),
      type: 'toplanti'
    },
    {
      id: 'payment-1',
      title: 'Abonelik Ödeme Günü',
      description: 'Piktram Premium plan faturası. Otomatik ödeme kontrol edilecek.',
      date: addDays(today, 5).toISOString(),
      type: 'odeme'
    },
    {
      id: 'report-1',
      title: 'Haziran Performans Raporu',
      description: 'Google Data Studio raporunu müşteriye paylaşın ve arşive ekleyin.',
      date: addDays(today, 7).toISOString(),
      type: 'rapor'
    }
  ]

  const events: AgendaEvent[] = [...taskEvents, ...staticEvents]

  const upcomingEvents = [...events]
    .filter((event) => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6)

  return (
    <div className="space-y-8">
      <Card
        title="Ajanda"
        description="İçerik teslimleri, toplantılar ve finansal hatırlatmaları tek takvimde yönetin."
      >
        <Calendar events={events} />
      </Card>

      <Card
        title="Yaklaşan Etkinlikler"
        description="Önümüzdeki günlerde hazırlanmanız gereken aksiyonlar."
      >
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ajandada yaklaşan etkinlik bulunmuyor. Yeni görevler eklediğinizde otomatik olarak burada listelenecek.
            </p>
          ) : (
            upcomingEvents.map((event) => {
              const meta = eventTypeMeta[event.type]
              return (
                <ListItem
                  key={event.id}
                  icon={<span className="text-lg">🗓️</span>}
                  title={event.title}
                  description={event.description}
                  meta={`${formatDate(event.date)}${event.related ? ` • ${event.related}` : ''}`}
                  tag={meta.label}
                  tagColor={meta.tagColor}
                  tone={meta.tone}
                  compact
                />
              )
            })
          )}
        </div>
      </Card>

      <Card
        title="Ajanda İpuçları"
        description="Takvimi ekiple senkron tutmak için hatırlatmalar."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Supabase fonksiyonlarını kullanarak takvimi Google Calendar ile senkronize edebilirsiniz. Hazırlanan webhook taslağı paylaşım için hazır.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Toplantı notlarını Cal.com entegrasyonundan otomatik olarak kaydetmek için API anahtarlarınızı Ayarlar sekmesinden ekleyin.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Ödeme günleri için hatırlatma e-postaları göndermek üzere Supabase Edge Functions planlandı. Aktivasyon sonrası burada tetiklenecek.
          </div>
        </div>
      </Card>
    </div>
  )
}
