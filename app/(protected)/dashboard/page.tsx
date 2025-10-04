import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { StatCard } from '@/components/dashboard/stat-card'
import { WeeklyCompletionChart } from '@/components/dashboard/charts'
import { TodayTasks } from '@/components/dashboard/today-tasks'
import { ProjectProgressDonut } from '@/components/dashboard/charts'
import type { Task } from '@/lib/types'
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

  const tasks = (tasksData ?? []) as unknown as Task[]
  const projects = projectsData ?? []

  // Stat hesaplamaları
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) =>
    COMPLETED_STATUSES.includes(normalizeStatus(t.status))
  ).length
  const delayedTasks = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date()
  ).length
  const activeProjects = projects.filter((p) => p.progress < 100).length
  const completedProjects = projects.filter((p) => p.progress >= 100).length
  const remainingProjects = projects.length - completedProjects

  // Haftalık veri
  const weeklyData = Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(new Date(), 6 - index)
    const label = format(date, 'dd MMM', { locale: tr })
    const value = tasks.filter((task) => {
      const normalized = normalizeStatus(task.status)
      return (
        COMPLETED_STATUSES.includes(normalized) &&
        task.due_date &&
        isSameDay(new Date(task.due_date), date)
      )
    }).length
    return { label, value }
  })

  // Bugünkü görevler
 const todayTasks = tasks.filter(
  (task) => task.due_date && isSameDay(new Date(task.due_date), new Date())
);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF5E4A] via-[#FF704F] to-[#FF8469] p-10 text-white shadow-brand-card">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/70">Piktram çalışma alanı</p>
            <h1 className="mt-3 text-3xl font-semibold">
              Hoş geldin, {profile?.full_name ?? session.user.user_metadata?.full_name ?? 'Piktram Kullanıcısı'} 👋
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/80">
              Günün kritik görevlerini gözden geçir, takvimine yeni aksiyonlar ekle ve ekibinin performansını anlık olarak takip et.
            </p>
            {isAdmin && (
              <p className="mt-4 inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                Yönetici görünümü aktif — tüm ekip verileri görüntüleniyor
              </p>
            )}
          </div>
          <div className="rounded-3xl bg-white/15 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Bugün</p>
            <p className="mt-2 text-4xl font-semibold">{todayTasks.length}</p>
            <p className="text-sm text-white/80">Takviminde tamamlanmayı bekleyen görev</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Toplam Görev" value={totalTasks} description="Tüm projelerdeki görev sayısı" />
        <StatCard label="Tamamlanan" value={completedTasks} description="Son durum olarak tamamlanan görevler" />
        <StatCard label="Geciken" value={delayedTasks} description="Zamanı geçmiş görevler" />
        <StatCard label="Aktif Projeler" value={activeProjects} description="Devam eden proje sayısı" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyCompletionChart data={weeklyData} />
        </div>
        <ProjectProgressDonut completed={completedProjects} remaining={remainingProjects} />
      </div>

      {/* Today Tasks */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Bugünkü Görevler</h2>
        <TodayTasks tasks={todayTasks} />
      </div>
    </div>
  )
}
