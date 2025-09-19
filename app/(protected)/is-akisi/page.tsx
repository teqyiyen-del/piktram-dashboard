import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import KanbanBoard from '@/components/tasks/kanban-board'
import { SectionHeader } from '@/components/layout/section-header'
import { Task } from '@/lib/types'

export default async function IsAkisiPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const tasksQuery = supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true })

  const projectsQuery = supabase
    .from('projects')
    .select('id, title, user_id')

  if (!isAdmin) {
    tasksQuery.eq('user_id', session.user.id)
    projectsQuery.eq('user_id', session.user.id)
  }

  const [{ data: tasksData }, { data: projectsData }] = await Promise.all([
    tasksQuery,
    projectsQuery
  ])

  const tasks = (tasksData ?? []) as unknown as Task[]
  const projectOptions = (projectsData ?? []).map((p) => ({
    id: p.id,
    title: p.title
  }))

  return (
    <div className="space-y-10 px-layout-x py-layout-y">
      {/* Section Header */}
      <SectionHeader
        title="İş Akışı"
        subtitle="İçerik üretim sürecindeki görevlerinizi kanban panosunda takip edin."
        badge="Görev Yönetimi"
        gradient
      />

      {/* Bilgilendirme kutuları */}
      <Card
        title="Nasıl Çalışır?"
        description="Görevlerinizi sütunlar arasında sürükleyip bırakarak güncel tutabilirsiniz."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-600 shadow-sm dark:bg-surface-dark/50 dark:text-gray-300">
            <span className="font-medium text-gray-800 dark:text-white">
              Anında Senkronizasyon
            </span>
            <p className="mt-2">
              Kartları taşıdığınızda durumlar Supabase üzerinde anında güncellenir
              ve ekip arkadaşlarınız bilgilendirilir.
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-600 shadow-sm dark:bg-surface-dark/50 dark:text-gray-300">
            <span className="font-medium text-gray-800 dark:text-white">
              Onay Süreçleri
            </span>
            <p className="mt-2">
              Revize ve Onay aşamalarını düzenli tutarak müşteri onay sürecini hızlandırabilirsiniz.
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-600 shadow-sm dark:bg-surface-dark/50 dark:text-gray-300">
            <span className="font-medium text-gray-800 dark:text-white">
              Raporlama
            </span>
            <p className="mt-2">
              Paylaşıldı sütununa taşınan görevler raporlara otomatik olarak yansır.
            </p>
          </div>
        </div>
      </Card>

      {/* Kanban Board */}
      <Card>
        <KanbanBoard initialTasks={tasks} projects={projectOptions} />
      </Card>
    </div>
  )
}
