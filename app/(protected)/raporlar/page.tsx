import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import { ChartContainer } from '@/components/sections/chart-container'
import { InfoGrid } from '@/components/ui/info-grid'
import { ListItem } from '@/components/sections/list-item'
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

  if (!session) {
    return null
  }

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
  const weeklyReports = reports.filter((report) => report.period === 'weekly')
  const monthlyReports = reports.filter((report) => report.period === 'monthly')

  const avgFollowersWeekly = weeklyReports.length
    ? Math.round(weeklyReports.reduce((sum, report) => sum + report.followers, 0) / weeklyReports.length)
    : 0
  const avgLikesWeekly = weeklyReports.length
    ? Math.round(weeklyReports.reduce((sum, report) => sum + report.likes, 0) / weeklyReports.length)
    : 0
  const avgPostsMonthly = monthlyReports.length
    ? Math.round(monthlyReports.reduce((sum, report) => sum + report.posts, 0) / monthlyReports.length)
    : 0
  const avgEngagementMonthly = monthlyReports.length
    ? (monthlyReports.reduce((sum, report) => sum + (report.engagement_rate ?? 0), 0) / monthlyReports.length).toFixed(1)
    : '0.0'

  const summaryStats = [
    {
      label: 'Toplam Rapor',
      value: reports.length.toString(),
      helper: 'Haftalık ve aylık rapor sayısı'
    },
    {
      label: 'Haftalık Ortalama Takipçi',
      value: `${formatNumber(avgFollowersWeekly)} kişi`,
      helper: 'Haftalık raporlardaki ortalama artış'
    },
    {
      label: 'Haftalık Ortalama Beğeni',
      value: `${formatNumber(avgLikesWeekly)}`,
      helper: 'Etkileşim performansı'
    },
    {
      label: 'Aylık Ortalama İçerik',
      value: `${formatNumber(avgPostsMonthly)} gönderi`,
      helper: 'Aylık içerik üretim temposu'
    }
  ]

  const weeklyChartData = weeklyReports
    .slice()
    .reverse()
    .map((report) => ({
      label: report.period_label ?? formatDate(report.created_at),
      followers: report.followers,
      likes: report.likes,
      posts: report.posts
    }))

  const monthlyChartData = monthlyReports
    .slice()
    .reverse()
    .map((report) => ({
      label: report.period_label ?? formatDate(report.created_at),
      followers: report.followers,
      likes: report.likes,
      posts: report.posts
    }))

  const renderDownloadLink = (url: string | null) => {
    if (!url) return null
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-accent-dark"
      >
        PDF İndir
      </a>
    )
  }

  return (
    <div className="space-y-10">
      <Card title="Rapor Özeti" description="Ana metriklerinizi tek bakışta değerlendirin.">
        <InfoGrid items={summaryStats} columns={4} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartContainer
          title="Haftalık Performans"
          description="Haftalık bazda takipçi artışı, beğeni ve paylaşım trendleri."
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Haftalık Raporlar"
          description="Son haftalarda yayınlanan raporlar ve öne çıkan notlar."
        >
          <div className="space-y-4">
            {weeklyReports.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Henüz haftalık rapor bulunmuyor.</p>
            ) : (
              weeklyReports.map((report) => (
                <ListItem
                  key={report.id}
                  title={report.title}
                  description={report.summary ?? 'Özet bilgisi eklenmedi.'}
                  meta={`${report.period_label ?? formatDate(report.created_at)} • Takipçi: ${formatNumber(report.followers)}`}
                  tone="violet"
                  icon={<span className="text-lg">📊</span>}
                  rightSlot={renderDownloadLink(report.file_url)}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Henüz aylık rapor bulunmuyor.</p>
            ) : (
              monthlyReports.map((report) => (
                <ListItem
                  key={report.id}
                  title={report.title}
                  description={report.summary ?? 'Özet bilgisi eklenmedi.'}
                  meta={`${report.period_label ?? formatDate(report.created_at)} • Beğeni: ${formatNumber(report.likes)}`}
                  tone="emerald"
                  icon={<span className="text-lg">📈</span>}
                  rightSlot={renderDownloadLink(report.file_url)}
                />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
