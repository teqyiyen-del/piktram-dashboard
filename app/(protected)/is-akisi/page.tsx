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

  if (!session) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const tasksQuery = supabase.from('tasks').select('*').order('due_date', { ascending: true })

  const projectsQuery = supabase.from('projects').select('id, title, user_id')

  if (!isAdmin) {
    tasksQuery.eq('user_id', session.user.id)
    projectsQuery.eq('user_id', session.user.id)
  }

  const [{ data: tasksData }, { data: projectsData }] = await Promise.all([tasksQuery, projectsQuery])
  const tasks = (tasksData ?? []) as unknown as Task[]
  const projectOptions = (projectsData ?? []).map((project) => ({ id: project.id, title: project.title }))

  return (
    <div className="space-y-8">
      <Card
        title="İş Akışı"
        description="İçerik üretim sürecindeki kartları sütunlar arasında sürükleyerek durum değişikliklerini yönetin."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Kartları taşıdığınızda durumlar Supabase üzerinde anında güncellenir ve ekip arkadaşlarınız bilgilendirilir.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Revize ve Onay Sürecinde sütunlarını düzenli tutarak müşteri onay sürecini hızlandırabilirsiniz.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Paylaşıldı sütununa taşınan görevler raporlara otomatik olarak yansıyacak şekilde yapılandırıldı.
          </div>
        </div>
      </Card>

      <KanbanBoard initialTasks={tasks} projects={projectOptions} />
    </div>
  )
}
