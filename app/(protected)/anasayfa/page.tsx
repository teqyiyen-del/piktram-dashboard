import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { ChartContainer } from '@/components/sections/chart-container'
import { StatusChart } from '@/components/sections/status-chart'
import { formatDate } from '@/lib/utils'
import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns'
import { Project, Task } from '@/lib/types'

export default async function AnasayfaPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', session.user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const tasksQuery = supabase
    .from('tasks')
    .select('id, title, description, status, priority, due_date, attachment_url, user_id')
    .order('due_date', { ascending: true })

  const projectsQuery = supabase
    .from('projects')
    .select('id, title, description, progress, due_date, user_id')
    .order('due_date', { ascending: true })

  if (!isAdmin) {
    tasksQuery.eq('user_id', session.user.id)
    projectsQuery.eq('user_id', session.user.id)
  }

  const { data: tasksData } = await tasksQuery
  const { data: projectsData } = await projectsQuery

  const tasks: Task[] = (tasksData ?? []) as Task[]
  const projects: Project[] = (projectsData ?? []) as Project[]

  const startToday = startOfDay(new Date())
  const upcomingLimit = addDays(startToday, 7)

  const awaitingApproval = tasks.filter((task) => task.status === 'in_progress')
  const awaitingCount = awaitingApproval.length

  const todoCount = tasks.filter((task) => task.status === 'todo').length
  const doneCount = tasks.filter((task) => task.status === 'done').length

  const upcomingAgenda = tasks
    .filter((task) => {
      if (!task.due_date) return false
      const due = new Date(task.due_date)
      return due >= startToday && due <= upcomingLimit
    })
    .sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })
    .slice(0, 4)

  const overdueAwaiting = awaitingApproval.filter((task) => {
    if (!task.due_date) return false
    return new Date(task.due_date) < startToday
  }).length

  const activeProjects = projects.filter((project) => project.progress < 100).length

  const chartData = [
    { label: 'Planlandı', value: todoCount, color: '#F59E0B' },
    { label: 'Onay Bekliyor', value: awaitingCount, color: '#FF5E4A' },
    { label: 'Tamamlandı', value: doneCount, color: '#22C55E' }
  ]

  const priorityLabels: Record<'low' | 'medium' | 'high', string> = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek'
  }

  const metaForDueDate = (dueDate: string | null) => {
    if (!dueDate) return upcomingLabel(null)
    return `${formatDate(dueDate)} • ${upcomingLabel(dueDate)}`
  }

  const upcomingLabel = (dueDate: string | null) => {
    if (!dueDate) return 'Teslim tarihi bekleniyor'
    const due = new Date(dueDate)
    const diff = differenceInCalendarDays(due, startToday)
    if (diff === 0) return 'Bugün teslim'
    if (diff === 1) return 'Yarın teslim'
    if (diff < 0) return `${Math.abs(diff)} gün gecikti`
    return `${diff} gün kaldı`
  }

  const metrics = [
    {
      label: 'Onay Bekleyen Görev',
      value: awaitingCount,
      description: 'Yayınlanmayı bekleyen içerikler'
    },
    {
      label: 'Bu Hafta Ajanda',
      value: upcomingAgenda.length,
      description: '7 gün içinde teslim edilecek görevler'
    },
    {
      label: 'Tamamlanan Görev',
      value: doneCount,
      description: 'Kapanan işler'
    },
    {
      label: 'Aktif Proje',
      value: activeProjects,
      description: 'Devam eden kampanyalar'
    }
  ]

  const greetingName = profile?.full_name ?? session.user.user_metadata?.full_name ?? 'Piktram Kullanıcısı'

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF5E4A] via-[#FF704F] to-[#FF8469] p-10 text-white shadow-brand-card">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">Ajans kontrol paneli</p>
            <h1 className="mt-3 text-3xl font-semibold">Hoş geldin, {greetingName.split(' ')[0]} 👋</h1>
            <p className="mt-3 max-w-xl text-sm text-white/80">
              Onay bekleyen içeriklerini gözden geçir, ajandanı planla ve ekip üretkenliğini anlık olarak takip et.
            </p>
            <div className="mt-4 inline-flex items-center gap-3 rounded-full bg-white/15 px-5 py-2 text-sm font-medium">
              <span className="text-2xl font-semibold">{awaitingCount}</span>
              <span className="max-w-[10rem] text-xs uppercase tracking-[0.2em] text-white/80">Onay bekleyen görev</span>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Bugünün Planı</p>
            <p className="mt-3 text-4xl font-semibold">{upcomingAgenda.length}</p>
            <p className="text-sm text-white/80">Bu hafta teslimi yaklaşan içerik</p>
            {overdueAwaiting > 0 ? (
              <p className="mt-4 rounded-2xl bg-white/10 px-4 py-2 text-xs font-medium text-white">
                {overdueAwaiting} onay bekleyen görev gecikmiş durumda
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card
          title="Ajanda Önizlemesi"
          description="Yaklaşan toplantı ve içerik teslimlerini hızlıca gözden geçirin."
          className="lg:col-span-3"
        >
          <div className="space-y-4">
            {upcomingAgenda.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Önümüzdeki 7 gün içinde ajandada görev bulunmuyor. Yeni görev oluşturduğunuzda burada görünecek.
              </p>
            ) : (
              upcomingAgenda.map((task) => (
                <ListItem
                  key={task.id}
                  icon={<span className="text-lg">🗂️</span>}
                  title={task.title}
                  description={task.description ?? 'Detay bilgisi eklenmedi.'}
                  meta={metaForDueDate(task.due_date)}
                  tag="Ajanda"
                  tagColor="info"
                  tone="blue"
                  compact
                  rightSlot={
                    <span className="pill bg-white/80 text-gray-500 dark:bg-surface-dark/80">
                      Öncelik: {priorityLabels[task.priority]}
                    </span>
                  }
                />
              ))
            )}
          </div>
        </Card>

        <Card
          title="Sayısal Verilerle Özet"
          description="Kritik göstergeleri tek bakışta inceleyin."
          className="lg:col-span-2"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-surface-dark/80">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {metric.label}
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{metric.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <ChartContainer
          title="Chart Özet"
          description="Görev durumlarının güncel dağılımı."
          className="lg:col-span-3"
        >
          <StatusChart data={chartData} />
        </ChartContainer>

        <Card
          title="Onay Bekleyen İçerikler"
          description="Onaya gönderdikten sonra müşteriden yanıt bekleyen çalışmalar."
          className="lg:col-span-2"
        >
          <div className="space-y-3">
            {awaitingApproval.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Şu anda onay bekleyen içerik bulunmuyor. Sürece yeni çalışmalar eklediğinizde burada listelenecek.
              </p>
            ) : (
              awaitingApproval.slice(0, 6).map((task) => (
                <ListItem
                  key={task.id}
                  icon={<span className="text-lg">📌</span>}
                  title={task.title}
                  description={task.description ?? 'Detay bilgisi eklenmedi.'}
                  meta={metaForDueDate(task.due_date)}
                  tag="Onay Bekliyor"
                  tagColor="warning"
                  tone="amber"
                  compact
                />
              ))
            )}
          </div>
        </Card>
      </div>

      <Card
        title="Güncel Haberler"
        description="İçerik ekibine ait hızlı notlar ve takip edilmesi gereken başlıklar."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Onay süreci tamamlandığında otomatik bildirimler Slack ve e-posta kanallarınıza gönderilecek. Entegrasyon çalışması
            planlandı.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            İçerik teslimlerinden önce marka rehberlerini kontrol etmeyi unutmayın. Revize sayısını azaltmak için checklist
            hazırlık aşamasında.
          </div>
        </div>
      </Card>
    </div>
  )
}
