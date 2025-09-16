import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { WorkflowBoard } from '@/components/sections/workflow-board'
import { Card } from '@/components/sections/card'
import { Project, Task, WorkflowItem, WorkflowStatus } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { addDays } from 'date-fns'

const statusMap: Record<'todo' | 'in_progress' | 'done', WorkflowStatus> = {
  todo: 'yapiliyor',
  in_progress: 'onay_surecinde',
  done: 'onaylandi'
}

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
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const tasksQuery = supabase
    .from('tasks')
    .select('id, title, status, due_date, project_id, user_id')

  const projectsQuery = supabase.from('projects').select('id, title, user_id')

  if (!isAdmin) {
    tasksQuery.eq('user_id', session.user.id)
    projectsQuery.eq('user_id', session.user.id)
  }

  const [{ data: tasksData }, { data: projectsData }] = await Promise.all([tasksQuery, projectsQuery])

  const projects = new Map(((projectsData ?? []) as Project[]).map((project) => [project.id, project.title]))

  const workflowItemsFromTasks: WorkflowItem[] = ((tasksData ?? []) as Task[]).map((task) => ({
    id: `task-${task.id}`,
    title: task.title,
    brand: projects.get(task.project_id ?? '') ?? 'Genel Görev',
    deadline: task.due_date ? formatDate(task.due_date) : null,
    owner: profile?.full_name ?? session.user.email!,
    status: statusMap[task.status]
  }))

  const today = new Date()

  const staticItems: WorkflowItem[] = [
    {
      id: 'revize-1',
      title: 'Haziran Lansman Videosu',
      brand: 'ModaX',
      deadline: formatDate(addDays(today, 2).toISOString()),
      owner: 'Ece Demir',
      status: 'revize'
    },
    {
      id: 'paylasildi-1',
      title: 'Blog Yazısı – CRM Otomasyonu',
      brand: 'TechFlow',
      deadline: formatDate(addDays(today, -1).toISOString()),
      owner: 'Can Yıldız',
      status: 'paylasildi'
    },
    {
      id: 'onay-1',
      title: 'LinkedIn Carousel – Çeyrek Özeti',
      brand: 'Brightly',
      deadline: formatDate(addDays(today, 1).toISOString()),
      owner: 'Piktram Ekibi',
      status: 'onay_surecinde'
    }
  ]

  const combinedItems = [...workflowItemsFromTasks, ...staticItems]

  return (
    <div className="space-y-8">
      <Card
        title="İş Akışı"
        description="İçerik üretim sürecindeki kartları sütunlar arasında sürükleyerek durum değişikliklerini yönetin."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Kartları taşıdığınızda üst bölümde bildirim ön izlemesi görüntülenir. Yakında bu aksiyonlar ekip arkadaşlarınıza otomatik olarak iletilecek.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            “Revize” sütunundaki kartlar için müşteriye gönderilecek açıklama notlarını hazırlayın ve teslim tarihlerini güncel tutun.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            “Paylaşıldı” sütunu, sosyal medya ve blog yayınları tamamlandığında otomatik olarak doldurulacak. API bağlantısı hazırlık aşamasında.
          </div>
        </div>
      </Card>

      <WorkflowBoard items={combinedItems} />
    </div>
  )
}
