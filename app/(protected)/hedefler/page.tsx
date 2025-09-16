import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { InfoGrid } from '@/components/ui/info-grid'
import { ProgressList } from '@/components/ui/progress-list'

const kpis = [
  {
    title: 'İçerik Yayın Hızı',
    value: 72,
    targetLabel: "Hedef: Aylık yayın takviminin %85'i aktif",
    description: 'Planlanan gönderilerin zamanında yayınlanma oranı',
    tone: 'accent' as const
  },
  {
    title: 'Onay Süresi Kısaltma',
    value: 64,
    targetLabel: 'Hedef: Ortalama onay süresi 24 saatin altı',
    description: 'Revize taleplerinin kapanma hızı',
    tone: 'violet' as const
  },
  {
    title: 'Topluluk Etkileşimi',
    value: 58,
    targetLabel: 'Hedef: Aylık ortalama %70 etkileşim artışı',
    description: 'Sosyal medya gönderilerinin etkileşim puanı',
    tone: 'emerald' as const
  },
  {
    title: 'Rapora Dönüşen Kampanya',
    value: 44,
    targetLabel: "Hedef: Onaylanan kampanyaların %60'ı raporlandı",
    description: 'Tamamlanan kampanyalardan raporlananların oranı',
    tone: 'amber' as const
  }
]

const quarterHighlights = [
  {
    label: 'Çeyrek Odak Başlığı',
    value: 'Marka bilinirliği ve yeni müşteri edinimi'
  },
  {
    label: 'Öncelikli Segment',
    value: 'Perakende ve e-ticaret iş ortakları'
  },
  {
    label: 'Hedeflenen Kampanya Sayısı',
    value: '12',
    helper: 'Her kampanya için minimum iki format planlanıyor.'
  }
]

const initiatives = [
  {
    title: 'Instagram Reels Serisi',
    description: 'Sosyal medya trafiğini %30 artıracak 6 bölümlük seri üretimi.',
    meta: 'Sorumlu: Sosyal Medya Ekibi • Bitiş: 12 Nisan',
    status: 'Devam ediyor'
  },
  {
    title: 'İçerik Rehberi Revizyonu',
    description: 'Marka tonuna uygun yeni içerik kitinin yayıma hazırlanması.',
    meta: 'Sorumlu: İçerik Stratejisi • Bitiş: 30 Mart',
    status: 'Taslak tamamlandı'
  },
  {
    title: 'Müşteri Eğitim Oturumları',
    description: 'Piktram panel kullanımını hızlandıracak eğitim dizisi.',
    meta: 'Sorumlu: Müşteri Başarı • İlk oturum: 5 Nisan',
    status: 'Takvimlendi'
  }
]

export default function HedeflerPage() {
  return (
    <div className="space-y-10">
      <Card
        title="Çeyrek Yol Haritası"
        description="Takımın bu çeyrek için belirlediği stratejik odağı ve öncelikleri gözden geçirin."
      >
        <InfoGrid items={quarterHighlights} columns={3} />
      </Card>

      <Card
        title="Ana KPI'lar"
        description="İlerleme çubukları hedeflere yaklaşımınızı gösterir. Veriler Supabase kaynaklı entegre olduğunda otomatik güncellenecektir."
      >
        <ProgressList items={kpis} />
      </Card>

      <Card
        title="Öncelikli Girişimler"
        description="Takımın hedefleri desteklemek için yürüttüğü ana aksiyonları takip edin."
      >
        <div className="space-y-4">
          {initiatives.map((initiative) => (
            <ListItem
              key={initiative.title}
              title={initiative.title}
              description={initiative.description}
              meta={initiative.meta}
              tag={initiative.status}
              tagColor="info"
              tone="violet"
              icon={<span className="text-lg">🎯</span>}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
