import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { SectionHeader } from '@/components/layout/section-header'
import { formatDate } from '@/lib/utils'
import { addDays, differenceInCalendarDays } from 'date-fns'
import { Project, Task } from '@/lib/types'

export default async function ProjelerPage() {
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

  const projectsQuery = supabase
    .from('projects')
    .select('id, title, description, progress, due_date, user_id')
    .order('due_date', { ascending: true })

  const tasksQuery = supabase
    .from('tasks')
    .select('id, title, status, project_id, due_date, user_id')

  if (!isAdmin) {
    projectsQuery.eq('user_id', session.user.id)
    tasksQuery.eq('user_id', session.user.id)
  }

  const [{ data: projectsData }, { data: tasksData }] = await Promise.all([
    projectsQuery,
    tasksQuery
  ])

  const projects: Project[] = (projectsData ?? []) as Project[]
  const tasks: Task[] = (tasksData ?? []) as Task[]

  const completedStatuses = new Set<Task['status']>(['onaylandi', 'paylasildi'])

  const tasksByProject = tasks.reduce<
    Record<string, { total: number; done: number; upcoming: number }>
  >((acc, task) => {
    if (!task.project_id) return acc
    if (!acc[task.project_id]) {
      acc[task.project_id] = { total: 0, done: 0, upcoming: 0 }
    }
    acc[task.project_id].total += 1
    if (completedStatuses.has(task.status)) {
      acc[task.project_id].done += 1
    }
    if (task.due_date) {
      const diff = differenceInCalendarDays(new Date(task.due_date), new Date())
      if (diff >= 0 && diff <= 7) {
        acc[task.project_id].upcoming += 1
      }
    }
    return acc
  }, {})

  const projectSummaries = projects.map((project) => {
    const taskInfo = tasksByProject[project.id] ?? {
      total: 0,
      done: 0,
      upcoming: 0
    }
    return {
      ...project,
      tasksTotal: taskInfo.total,
      tasksDone: taskInfo.done,
      upcomingTasks: taskInfo.upcoming
    }
  })

  const today = new Date()
  const soonThreshold = addDays(today, 21)

  const campaigns = projectSummaries
    .filter((project) => project.due_date && new Date(project.due_date) <= soonThreshold)
    .sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })

  const remaining = projectSummaries
    .filter((project) => !campaigns.some((campaign) => campaign.id === project.id))
    .sort((a, b) => (a.progress > b.progress ? -1 : 1))

  const highlightedCampaigns = [...campaigns, ...remaining].slice(0, 4)

  const totalProjects = projectSummaries.length
  const activeProjects = projectSummaries.filter((p) => p.progress < 100).length
  const completedProjects = projectSummaries.filter((p) => p.progress >= 100).length
  const upcomingDeadlines = projectSummaries.filter((p) => {
    if (!p.due_date) return false
    const due = new Date(p.due_date)
    return due >= today && due <= soonThreshold
  }).length

  return (
    <div className="space-y-10 px-layout-x py-layout-y">
      {/* Section Header */}
      <SectionHeader
        title="Projeler"
        subtitle="Kampanyalarınızı, teslim tarihlerini ve genel proje durumunu takip edin."
        badge="Proje Yönetimi"
        gradient
      />

      {/* Kampanyalar */}
      <Card title="Kampanyalar" description="Yaklaşan teslim tarihleri ve öne çıkan projeler">
        <div className="space-y-4">
          {highlightedCampaigns.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Henüz kampanya bulunmuyor.
            </p>
          ) : (
            highlightedCampaigns.map((campaign) => (
              <div key={campaign.id} className="space-y-2">
                <ListItem
                  title={campaign.title}
                  description={campaign.description ?? 'Açıklama eklenmedi.'}
                  meta={
                    campaign.due_date
                      ? `${formatDate(campaign.due_date)} • ${campaign.tasksTotal} görev`
                      : `${campaign.tasksTotal} görev`
                  }
                  compact
                  rightSlot={
                    <span className="pill bg-white/80 text-gray-700 dark:bg-surface-dark/80">
                      %{campaign.progress}
                    </span>
                  }
                />
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: `${Math.min(100, Math.max(0, campaign.progress))}%`
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Proje Listesi */}
      <Card title="Proje Listesi" description="Tüm projelerinizin ilerleme durumları">
        <div className="space-y-4">
          {projectSummaries.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Henüz proje oluşturulmadı.
            </p>
          ) : (
            projectSummaries.map((project) => (
              <div key={project.id} className="space-y-2">
                <ListItem
                  title={project.title}
                  description={project.description ?? 'Açıklama girilmedi.'}
                  meta={
                    project.due_date
                      ? `${formatDate(project.due_date)} • ${project.tasksDone}/${project.tasksTotal} görev tamamlandı`
                      : `${project.tasksDone}/${project.tasksTotal} görev tamamlandı`
                  }
                  compact
                  rightSlot={
                    project.upcomingTasks > 0 ? (
                      <span className="pill bg-white/80 text-accent dark:bg-surface-dark/80">
                        {project.upcomingTasks} yaklaşan
                      </span>
                    ) : null
                  }
                />
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: `${Math.min(100, Math.max(0, project.progress))}%`
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Durum Özeti */}
      <Card title="Durum Özeti" description="Genel performans görünümü">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/90 p-4 text-sm shadow-sm dark:bg-surface-dark/80">
            <p className="text-xs font-semibold uppercase text-gray-500">Toplam Proje</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {totalProjects}
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-sm shadow-sm dark:bg-surface-dark/80">
            <p className="text-xs font-semibold uppercase text-gray-500">Aktif</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {activeProjects}
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-sm shadow-sm dark:bg-surface-dark/80">
            <p className="text-xs font-semibold uppercase text-gray-500">Tamamlanan</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {completedProjects}
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-sm shadow-sm dark:bg-surface-dark/80">
            <p className="text-xs font-semibold uppercase text-gray-500">Yaklaşan Teslim</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {upcomingDeadlines}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
