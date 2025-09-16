import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { StatCard } from '@/components/dashboard/stat-card'
import { WeeklyCompletionChart, ProjectProgressDonut } from '@/components/dashboard/charts'
import { TodayTasks } from '@/components/dashboard/today-tasks'
import { subDays, isSameDay, format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { COMPLETED_STATUSES, normalizeStatus } from '@/lib/task-status'

export default async function DashboardPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', session.user.id)

  const { data: projectsData } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', session.user.id)

  const tasks = tasksData ?? []
  const projects = projectsData ?? []

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => COMPLETED_STATUSES.includes(normalizeStatus(task.status))).length
  const delayedTasks = tasks.filter((task) => {
    if (!task.due_date) return false
    const dueDate = new Date(task.due_date)
    return dueDate < new Date() && !COMPLETED_STATUSES.includes(normalizeStatus(task.status))
  }).length
  const activeProjects = projects.filter((project) => project.progress < 100).length

  const weeklyData = Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(new Date(), 6 - index)
    const label = format(date, 'dd MMM', { locale: tr })
    const value = tasks.filter((task) => {
      const normalized = normalizeStatus(task.status)
      return (
        COMPLETED_STATUSES.includes(normalized) && task.due_date && isSameDay(new Date(task.due_date), date)
      )
    }).length
    return { label, value }
  })

  const completedProjects = projects.filter((project) => project.progress >= 100).length
  const remainingProjects = projects.length - completedProjects

  const todayTasks = tasks.filter((task) => task.due_date && isSameDay(new Date(task.due_date), new Date()))

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Hoş geldin, {session.user.user_metadata?.full_name ?? 'Piktram Kullanıcısı'} 👋</h1>
        <p className="mt-2 text-sm text-gray-500">Bugünün planını kontrol et ve ekip arkadaşlarınla senkronize ol.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Toplam Görev" value={totalTasks} description="Tüm projelerdeki görev sayısı" />
        <StatCard label="Tamamlanan" value={completedTasks} description="Son durum olarak tamamlanan görevler" />
        <StatCard label="Geciken" value={delayedTasks} description="Zamanı geçmiş görevler" />
        <StatCard label="Aktif Projeler" value={activeProjects} description="Devam eden proje sayısı" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyCompletionChart data={weeklyData} />
        </div>
        <ProjectProgressDonut completed={completedProjects} remaining={remainingProjects} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Bugünkü Görevler</h2>
        <TodayTasks tasks={todayTasks} />
      </div>
    </div>
  )
}
