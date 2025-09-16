import { Card } from '@/components/sections/card'
import { ChartContainer } from '@/components/sections/chart-container'
import { ListItem } from '@/components/sections/list-item'
import { InfoGrid } from '@/components/ui/info-grid'

const summaryStats = [
  { label: 'Toplam Kampanya', value: '24', helper: 'Önceki aya göre +4 artış' },
  { label: 'Ortalama Onay Süresi', value: '18 saat', helper: 'Hedeflenen 24 saatin altında' },
  { label: 'Tamamlanan Görev', value: '312', helper: 'Bu ay kapanan görev sayısı' },
  { label: 'Rapor Teslimi', value: '%92', helper: 'Takvime göre zamanında gönderilen raporlar' }
]

const weeklyInsights = [
  {
    title: 'Instagram Etkileşimleri',
    description: '%35 artış • Story izlenmelerinde ciddi büyüme',
    meta: 'Hafta 07 • Önceki haftaya göre +12.4K etkileşim',
    tone: 'violet' as const
  },
  {
    title: 'Blog Trafiği',
    description: '%18 artış • SEO içerikleri etkisi',
    meta: 'Hafta 07 • Organik kaynaklardan +8.1K oturum',
    tone: 'emerald' as const
  }
]

const monthlyInsights = [
  {
    title: 'Kampanya Performansı',
    description: 'Mart ayı kampanyalarında ortalama %4.3 tıklanma oranı',
    meta: 'En yüksek performanslı içerik: Bahar Lansmanı',
    tone: 'accent' as const
  },
  {
    title: 'Reklam Harcaması',
    description: 'Harcanan bütçe ₺124.500 • Getiri katsayısı 4.1x',
    meta: 'En verimli kanal: Instagram Reel Ads',
    tone: 'amber' as const
  },
  {
    title: 'Topluluk Büyümesi',
    description: 'Toplam takipçi sayısı 18.240 • Aylık %6,2 artış',
    meta: 'Yeni üyeler çoğunlukla organik kampanyalardan',
    tone: 'emerald' as const
  }
]

const chartPlaceholder = (label: string) => (
  <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
    <span className="pill bg-white/60 text-gray-500 dark:bg-gray-800/70 dark:text-gray-300">{label}</span>
    <p className="max-w-xs text-xs leading-relaxed">
      Chart.js entegrasyonu ile bu alan otomatik olarak Supabase verileriyle dolacaktır. Haftalık ve aylık rapor trendlerini görselleştirmek için hazır placeholder.
    </p>
  </div>
)

export default function RaporlarPage() {
  return (
    <div className="space-y-10">
      <Card
        title="Rapor Özeti"
        description="Ana metriklerinizi tek bakışta değerlendirin."
      >
        <InfoGrid items={summaryStats} columns={4} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartContainer
          title="Haftalık Performans"
          description="Haftalık bazda görev tamamlama ve etkileşim trendleri."
        >
          {chartPlaceholder('Haftalık performans grafiği')}
        </ChartContainer>

        <ChartContainer
          title="Aylık Dağılım"
          description="Aylık rapor kırılımları, kampanya türlerine göre özet."
        >
          {chartPlaceholder('Aylık dağılım grafiği')}
        </ChartContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Haftalık Notlar"
          description="Son haftada öne çıkan rapor içgörülerini inceleyin."
        >
          <div className="space-y-4">
            {weeklyInsights.map((insight) => (
              <ListItem
                key={insight.title}
                title={insight.title}
                description={insight.description}
                meta={insight.meta}
                tone={insight.tone}
                icon={<span className="text-lg">📊</span>}
              />
            ))}
          </div>
        </Card>

        <Card
          title="Aylık İçgörüler"
          description="Uzun dönemli trendleri ve stratejik önerileri takip edin."
        >
          <div className="space-y-4">
            {monthlyInsights.map((insight) => (
              <ListItem
                key={insight.title}
                title={insight.title}
                description={insight.description}
                meta={insight.meta}
                tone={insight.tone}
                icon={<span className="text-lg">📈</span>}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
