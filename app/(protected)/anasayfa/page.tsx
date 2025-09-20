// app/(protected)/anasayfa/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { ChartContainer } from '@/components/sections/chart-container'
import { formatDate } from '@/lib/utils'
import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns'
import { Bell, FolderKanban, Pin } from 'lucide-react'
import dynamic from 'next/dynamic'

// ✅ Client componentleri dynamic import (default export)
const StatusChart = dynamic(() => import('@/components/sections/status-chart'), {
  ssr: false,
})
const StatCard = dynamic(() => import('@/components/dashboard/stat-card'), {
  ssr: false,
})

// ✅ Normalize helper
const normalizeStatus = (status: string): string => {
  switch (status) {
    case 'onay_surecinde':
    case 'in_review':
      return 'in_review'
    case 'yapiliyor':
    case 'in_progress':
      return 'in_progress'
    case 'revize':
    case 'revision':
      return 'revision'
    case 'onaylandi':
    case 'approved':
      return 'approved'
    case 'paylasildi':
    case 'published':
      return 'published'
    default:
      return status
  }
}

export default async function AnasayfaPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  // ✅ Profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', session.user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // ✅ Workflows
  const workflowsQuery = supabase
    .from('workflows')
    .select('id, title, description, status, priority, due_date, user_id, created_at')
    .order('due_date', { ascending: true })

  if (!isAdmin) {
    workflowsQuery.eq('user_id', session.user.id)
  }

  const { data: workflowsData } = await workflowsQuery
  const workflows = (workflowsData ?? []).map((w) => ({
    ...w,
    status: normalizeStatus(w.status),
  }))

  // ✅ Projeler
  const projectsQuery = supabase
    .from('projects')
    .select('id, title, description, progress, due_date, user_id')
    .order('due_date', { ascending: true })

  if (!isAdmin) {
    projectsQuery.eq('user_id', session.user.id)
  }
  const { data: projectsData } = await projectsQuery
  const projects = projectsData ?? []

  // ✅ Tarihler
  const startToday = startOfDay(new Date())
  const upcomingLimit = addDays(startToday, 7)

  // ✅ Statüler
  const awaitingApproval = workflows.filter((w) => w.status === 'in_review')
  const awaitingCount = awaitingApproval.length || 0
  const yapiliyorCount = workflows.filter((w) => w.status === 'in_progress').length || 0
  const revizeCount = workflows.filter((w) => w.status === 'revision').length || 0
  const onaylandiCount = workflows.filter((w) => w.status === 'approved').length || 0
  const paylasildiCount = workflows.filter((w) => w.status === 'published').length || 0

  // ✅ Ajanda (önümüzdeki 7 gün)
  const upcomingAgenda = workflows
    .filter((w) => {
      if (!w.due_date) return false
      const due = new Date(w.due_date)
      return due >= startToday && due <= upcomingLimit
    })
    .sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })
    .slice(0, 4)

  const activeProjects = projects.filter((p) => p.progress < 100).length || 0

  // ✅ Grafik dataları
  const chartData = [
    { label: 'Yapılıyor', value: yapiliyorCount, color: '#3B82F6' },
    { label: 'Onay Sürecinde', value: awaitingCount, color: '#F97316' },
    { label: 'Revize', value: revizeCount, color: '#EF4444' },
    { label: 'Onaylandı', value: onaylandiCount, color: '#22C55E' },
    { label: 'Paylaşıldı', value: paylasildiCount, color: '#A855F7' },
  ]

  // ✅ Öncelik etiketleri
  const priorityLabels: Record<'low' | 'medium' | 'high', string> = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
  }

  // ✅ Teslim tarihi meta
  const upcomingLabel = (dueDate: string | null) => {
    if (!dueDate) return 'Teslim tarihi bekleniyor'
    const due = new Date(dueDate)
    const diff = differenceInCalendarDays(due, startToday)
    if (diff === 0) return 'Bugün teslim'
    if (diff === 1) return 'Yarın teslim'
    if (diff < 0) return `${Math.abs(diff)} gün gecikti`
    return `${diff} gün kaldı`
  }
  const metaForDueDate = (dueDate: string | null) => {
    if (!dueDate) return upcomingLabel(null)
    return `${formatDate(dueDate)} • ${upcomingLabel(dueDate)}`
  }

  // ✅ Metrics kartları
  const metrics = [
    { label: 'Onay Bekleyen', value: awaitingCount },
    { label: 'Teslim Edilecekler', value: upcomingAgenda.length || 0 },
    { label: 'Onaylanan Görev', value: onaylandiCount },
    { label: 'Aktif Proje', value: activeProjects },
  ]

  const greetingName =
    profile?.full_name ??
    session.user.user_metadata?.full_name ??
    'Piktram Kullanıcısı'

  // ✅ Son 2 duyuru
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, message, created_at')
    .order('created_at', { ascending: false })
    .limit(2)

  return (
    <div className="space-y-10 px-layout-x py-layout-y overflow-x-hidden">
      {/* Header */}
      <header
        className="rounded-3xl p-6 sm:p-10 text-white shadow-brand-card relative overflow-hidden"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              Ajans kontrol paneli
            </p>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold">
              Hoş geldin, {greetingName.split(' ')[0]}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/80">
              Onay bekleyen içeriklerinizi gözden geçirin, iş akışınızı kontrol edin.
            </p>
          </div>
          <StatCard label="Onay Bekleyen Görev" value={awaitingCount} variant="header" />
        </div>
      </header>

      {/* Ajanda + Özet */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        <Card
          title="Ajanda Önizlemesi"
          description="Yaklaşan toplantı ve içerik teslimlerini hızlıca gözden geçirin."
          className="lg:col-span-3 w-full min-w-0"
        >
          <div className="space-y-4">
            {upcomingAgenda.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Önümüzdeki 7 gün içinde ajandada görev bulunmuyor.
              </p>
            ) : (
              upcomingAgenda.map((w) => (
                <ListItem
                  key={w.id}
                  icon={
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                      <FolderKanban className="h-4 w-4 text-white" />
                    </div>
                  }
                  title={w.title}
                  description={w.description ?? 'Detay bilgisi eklenmedi.'}
                  meta={metaForDueDate(w.due_date)}
                  tag="Ajanda"
                  tagColor="info"
                  tone="blue"
                  compact
                  rightSlot={
                    <span className="pill bg-white/80 text-gray-500">
                      Öncelik:{' '}
                      {w.priority
                        ? priorityLabels[w.priority as 'low' | 'medium' | 'high']
                        : '—'}
                    </span>
                  }
                />
              ))
            )}
          </div>
        </Card>

        <Card
          title="Özet"
          description="Kritik göstergeleri tek bakışta inceleyin."
          className="lg:col-span-2 w-full min-w-0"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {metrics.map((metric) => (
              <StatCard key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </div>
        </Card>
      </div>

      {/* Chart + Onay Bekleyen */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        <ChartContainer
          title="Görev Tablosu Özeti"
          description="Görev durumlarının güncel dağılımı."
          className="lg:col-span-3 w-full min-w-0"
        >
          <StatusChart data={chartData} />
        </ChartContainer>

        <Card title="Onay Bekleyen İçerikler" className="lg:col-span-2 w-full min-w-0">
          <div className="space-y-3">
            {awaitingApproval.length === 0 ? (
              <p className="text-sm text-gray-500">
                Şu anda onay bekleyen içerik bulunmuyor.
              </p>
            ) : (
              awaitingApproval.slice(0, 6).map((w) => (
                <ListItem
                  key={w.id}
                  icon={
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                      <Pin className="h-4 w-4 text-white" />
                    </div>
                  }
                  title={w.title}
                  description={w.description ?? 'Detay bilgisi eklenmedi.'}
                  meta={metaForDueDate(w.due_date)}
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

      {/* Duyurular */}
      <Card
        title="Duyurular"
        description="Şirketimiz hakkında en son haberler ve güncellemeler"
        className="w-full min-w-0"
      >
        <div className="space-y-4">
          {announcements && announcements.length > 0 ? (
            announcements.map((a) => (
              <ListItem
                key={a.id}
                icon={
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                    <Bell className="h-4 w-4 text-white" />
                  </div>
                }
                title={a.title}
                description={a.message}
                meta={formatDate(a.created_at)}
                compact
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">Henüz duyuru bulunmuyor.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
