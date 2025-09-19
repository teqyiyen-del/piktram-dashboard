import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import { ChartContainer } from '@/components/sections/chart-container'
import { InfoGrid } from '@/components/ui/info-grid'
import { ListItem } from '@/components/sections/list-item'
import { SectionHeader } from '@/components/layout/section-header'
import { WeeklyReportsChart, MonthlyReportsChart } from '@/components/reports/reports-charts'
import type { Report } from '@/lib/types'
import { formatDate } from '@/lib/utils'

function formatNumber(value: number) {
  return new Intl.NumberFormat('tr-TR').format(value)
}

export default async function RaporlarPage() {
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

  const reportsQuery = supabase.from('reports').select('*').order('created_at', { ascending: false })

  if (!isAdmin) {
    reportsQuery.eq('user_id', session.user.id)
  }

  const { data: reportsData } = await reportsQuery

  const reports = (reportsData ?? []) as Report[]
  const weeklyReports = reports.filter((r) => r.period === 'weekly')
  const monthlyReports = reports.filter((r) => r.period === 'monthly')

  const avgFollowersWeekly = weeklyReports.length
    ? Math.round(weeklyReports.reduce((s, r) => s + r.followers, 0) / weeklyReports.length)
    : 0
  const avgLikesWeekly = weeklyReports.length
    ? Math.round(weeklyReports.reduce((s, r) => s + r.likes, 0) / weeklyReports.length)
    : 0
  const avgPostsMonthly = monthlyReports.length
    ? Math.round(monthlyReports.reduce((s, r) => s + r.posts, 0) / monthlyReports.length)
    : 0
  const avgEngagementMonthly = monthlyReports.length
    ? (monthlyReports.reduce((s, r) => s + (r.engagement_rate ?? 0), 0) / monthlyReports.length).toFixed(1)
    : '0.0'

  const summaryStats = [
    { label: 'Toplam Rapor', value: reports.length.toString(), helper: 'Haftalık + aylık toplam rapor' },
    { label: 'Haftalık Ortalama Takipçi', value: `${formatNumber(avgFollowersWeekly)} kişi`, helper: 'Takipçi artış ortalaması' },
    { label: 'Haftalık Ortalama Beğeni', value: `${formatNumber(avgLikesWeekly)}`, helper: 'Etkileşim performansı' },
    { label: 'Aylık Ortalama İçerik', value: `${formatNumber(avgPostsMonthly)} gönderi`, helper: 'Üretim temposu' }
  ]

  const weeklyChartData = weeklyReports.slice().reverse().map((r) => ({
    label: r.period_label ?? formatDate(r.created_at),
    followers: r.followers,
    likes: r.likes,
    posts: r.posts
  }))

  const monthlyChartData = monthlyReports.slice().reverse().map((r) => ({
    label: r.period_label ?? formatDate(r.created_at),
    followers: r.followers,
    likes: r.likes,
    posts: r.posts
  }))

  const renderDownloadLink = (url: string | null) =>
    url && (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-accent-dark"
      >
        PDF İndir
      </a>
    )

  return (
    <div className="space-y-10">
      {/* Gradient header */}
      <SectionHeader
        title="Raporlar"
        subtitle="Haftalık ve aylık performans raporlarınızı tek ekrandan takip edin."
        badge="Analiz Merkezi"
        gradient
      />

      {/* Özet */}
      <Card title="Rapor Özeti" description="Ana metriklerinizi tek bakışta değerlendirin.">
        <InfoGrid items={summaryStats} columns={4} />
      </Card>

      {/* Chartlar */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartContainer
          title="Haftalık Performans"
          description="Haftalık takipçi artışı, beğeni ve paylaşım trendleri."
        >
          <WeeklyReportsChart data={weeklyChartData} />
        </ChartContainer>

        <ChartContainer
          title="Aylık Dağılım"
          description="Aylık rapor kırılımları ve metriklerin eğilimleri."
        >
          <MonthlyReportsChart data={monthlyChartData} />
        </ChartContainer>
      </div>

      {/* Rapor listeleri */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Haftalık Raporlar" description="Son haftalarda yayınlanan raporlar.">
          <div className="space-y-4">
            {weeklyReports.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                Henüz haftalık rapor bulunmuyor.
              </p>
            ) : (
              weeklyReports.map((r) => (
                <ListItem
                  key={r.id}
                  title={r.title}
                  description={r.summary ?? 'Özet bilgisi eklenmedi.'}
                  meta={`${r.period_label ?? formatDate(r.created_at)} • Takipçi: ${formatNumber(r.followers)}`}
                  tone="violet"
                  icon={<span className="text-lg">📊</span>}
                  rightSlot={renderDownloadLink(r.file_url)}
                />
              ))
            )}
          </div>
        </Card>

        <Card
          title="Aylık Raporlar"
          description={`Son aylarda yayınlanan raporlar. Ortalama etkileşim oranı %${avgEngagementMonthly}.`}
        >
          <div className="space-y-4">
            {monthlyReports.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                Henüz aylık rapor bulunmuyor.
              </p>
            ) : (
              monthlyReports.map((r) => (
                <ListItem
                  key={r.id}
                  title={r.title}
                  description={r.summary ?? 'Özet bilgisi eklenmedi.'}
                  meta={`${r.period_label ?? formatDate(r.created_at)} • Beğeni: ${formatNumber(r.likes)}`}
                  tone="emerald"
                  icon={<span className="text-lg">📈</span>}
                  rightSlot={renderDownloadLink(r.file_url)}
                />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
