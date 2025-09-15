import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { StatCard } from '@/components/dashboard/stat-card'
import { WeeklyCompletionChart, ProjectProgressDonut } from '@/components/dashboard/charts'
import { TodayTasks } from '@/components/dashboard/today-tasks'
import { subDays, isSameDay, format } from 'date-fns'
import { tr } from 'date-fns/locale'

export default async function DashboardPage() {
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

  const tasksQuery = supabase.from('tasks').select('*')
  const projectsQuery = supabase.from('projects').select('*')

  if (!isAdmin) {
    tasksQuery.eq('user_id', session.user.id)
    projectsQuery.eq('user_id', session.user.id)
  }

  const { data: tasksData } = await tasksQuery
  const { data: projectsData } = await projectsQuery

  const tasks = tasksData ?? []
  const projects = projectsData ?? []

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === 'done').length
  const delayedTasks = tasks.filter((task) => {
    if (!task.due_date) return false
    const dueDate = new Date(task.due_date)
    return dueDate < new Date() && task.status !== 'done'
  }).length
  const activeProjects = projects.filter((project) => project.progress < 100).length

  const weeklyData = Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(new Date(), 6 - index)
    const label = format(date, 'dd MMM', { locale: tr })
    const value = tasks.filter(
      (task) => task.status === 'done' && task.due_date && isSameDay(new Date(task.due_date), date)
    ).length
    return { label, value }
  })

  const completedProjects = projects.filter((project) => project.progress >= 100).length
  const remainingProjects = projects.length - completedProjects

  const todayTasks = tasks.filter((task) => task.due_date && isSameDay(new Date(task.due_date), new Date()))

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-surface p-8 shadow-sm transition-colors duration-300 dark:bg-surface-dark">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Hoş geldin, {profile?.full_name ?? session.user.user_metadata?.full_name ?? 'Piktram Kullanıcısı'} 👋
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Bugünün planını kontrol et ve ekip arkadaşlarınla senkronize ol.</p>
        {isAdmin && (
          <p className="mt-4 text-xs font-medium text-accent">Yönetici görünümü: tüm ekip projelerini ve görevlerini izliyorsunuz.</p>
        )}
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
