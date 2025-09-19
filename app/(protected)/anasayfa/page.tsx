import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { ChartContainer } from '@/components/sections/chart-container'
import { StatusChart } from '@/components/sections/status-chart'
import { StatCard } from '@/components/dashboard/stat-card'
import { formatDate } from '@/lib/utils'
import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns'
import { Project, Task } from '@/lib/types'

export default async function AnasayfaPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) return null

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

  const awaitingApproval = tasks.filter((task) => task.status === 'onay_surecinde')
  const awaitingCount = awaitingApproval.length
  const yapiliyorCount = tasks.filter((task) => task.status === 'yapiliyor').length
  const revizeCount = tasks.filter((task) => task.status === 'revize').length
  const onaylandiCount = tasks.filter((task) => task.status === 'onaylandi').length
  const paylasildiCount = tasks.filter((task) => task.status === 'paylasildi').length

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

  const activeProjects = projects.filter((project) => project.progress < 100).length

  const chartData = [
    { label: 'Yapılıyor', value: yapiliyorCount, color: '#3B82F6' },
    { label: 'Onay Sürecinde', value: awaitingCount, color: '#F97316' },
    { label: 'Revize', value: revizeCount, color: '#EF4444' },
    { label: 'Onaylandı', value: onaylandiCount, color: '#22C55E' },
    { label: 'Paylaşıldı', value: paylasildiCount, color: '#A855F7' }
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
    { label: 'Onay Bekleyen Görev', value: awaitingCount, description: 'Yayınlanmayı bekleyen içerikler' },
    { label: 'Bu Hafta Ajanda', value: upcomingAgenda.length, description: '7 gün içinde teslim edilecek görevler' },
    { label: 'Onaylanan Görev', value: onaylandiCount, description: 'Onayınız alınmış işler' },
    { label: 'Aktif Proje', value: activeProjects, description: 'Devam eden projeler' }
  ]

  const greetingName = profile?.full_name ?? session.user.user_metadata?.full_name ?? 'Piktram Kullanıcısı'

  return (
    <div className="space-y-10 px-layout-x py-layout-y">
      {/* Gradient Header */}
      <header
        className="rounded-3xl p-10 text-white shadow-brand-card relative overflow-hidden"
        style={{ background: "linear-gradient(to right, #FF5E4A, #FA7C6B)" }}
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              Ajans kontrol paneli
            </p>
            <h1 className="mt-3 text-3xl font-semibold">
              Hoş geldin, {greetingName.split(' ')[0]} 👋
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/80">
              Onay bekleyen içeriklerini gözden geçir, ajandanı planla ve ekip üretkenliğini anlık olarak takip et.
            </p>
          </div>

          {/* Tek kutucuk: StatCard */}
          <StatCard
            label="Onay Bekleyen Görev"
            value={awaitingCount}
            variant="header"
          />
        </div>
      </header>

      {/* Ajanda ve Sayısal Veriler */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card
          title="Ajanda Önizlemesi"
          description="Yaklaşan toplantı ve içerik teslimlerini hızlıca gözden geçirin."
          className="lg:col-span-3"
        >
          <div className="space-y-4">
            {upcomingAgenda.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Önümüzdeki 7 gün içinde ajandada görev bulunmuyor.
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
                    <span className="pill bg-white/80 text-gray-500">
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
              <StatCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                description={metric.description}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Chart ve Onay Bekleyen İçerikler */}
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
              <p className="text-sm text-gray-500">
                Şu anda onay bekleyen içerik bulunmuyor.
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

      {/* Güncel Haberler */}
      <Card
        title="Güncel Haberler"
        description="İçerik ekibine ait hızlı notlar ve takip edilmesi gereken başlıklar."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
            Onay süreci tamamlandığında otomatik bildirimler Slack ve e-posta
            kanallarınıza gönderilecek.
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
            İçerik teslimlerinden önce marka rehberlerini kontrol etmeyi unutmayın.
          </div>
        </div>
      </Card>
    </div>
  )
}
