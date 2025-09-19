import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import KanbanBoard from '@/components/tasks/kanban-board'
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
    <div className="space-y-10">
      {/* Gradient Header */}
      <header
        className="rounded-2xl p-6 text-white shadow-sm"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <h1 className="text-xl md:text-2xl font-semibold">İş Akışı</h1>
        <p className="mt-1 text-sm text-white/90">
          İçerik üretim sürecindeki görevlerinizi kanban panosunda takip edin.
        </p>
      </header>

      {/* Bilgilendirme kutuları */}
      <Card
        title="Nasıl Çalışır?"
        description="Görevlerinizi sütunlar arasında sürükleyip bırakarak güncel tutabilirsiniz."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-600 shadow-sm dark:bg-surface-dark/50 dark:text-gray-300">
            <span className="font-medium text-gray-800 dark:text-white">
              🔄 Anında Senkronizasyon
            </span>
            <p className="mt-2">
              Kartları taşıdığınızda durumlar Supabase üzerinde anında güncellenir
              ve ekip arkadaşlarınız bilgilendirilir.
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-600 shadow-sm dark:bg-surface-dark/50 dark:text-gray-300">
            <span className="font-medium text-gray-800 dark:text-white">
              ✅ Onay Süreçleri
            </span>
            <p className="mt-2">
              Revize ve Onay aşamalarını düzenli tutarak müşteri onay sürecini hızlandırabilirsiniz.
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-600 shadow-sm dark:bg-surface-dark/50 dark:text-gray-300">
            <span className="font-medium text-gray-800 dark:text-white">
              📊 Raporlama
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
