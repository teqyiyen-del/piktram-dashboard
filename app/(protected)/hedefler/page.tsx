'use client'

import { Card } from '@/components/sections/card'
import { InfoGrid } from '@/components/ui/info-grid'
import { ProgressList } from '@/components/ui/progress-list'
import { SectionHeader } from '@/components/layout/section-header'

const kpis = [
  {
    title: 'Zamanında Yayın',
    value: 72,
    targetLabel: 'Hedef: %85',
    description: 'Planlanan gönderilerin zamanında paylaşılması',
    tone: 'accent' as const
  },
  {
    title: 'Onay Süresi',
    value: 64,
    targetLabel: 'Hedef: 24 saatin altı',
    description: 'Revizelerin kapanma hızı',
    tone: 'accent' as const
  },
  {
    title: 'Etkileşim',
    value: 58,
    targetLabel: 'Hedef: %70 artış',
    description: 'Gönderilerin ortalama etkileşimi',
    tone: 'accent' as const
  },
  {
    title: 'Kampanya Raporu',
    value: 44,
    targetLabel: 'Hedef: %60 rapor',
    description: 'Tamamlanan kampanyaların raporlanma oranı',
    tone: 'accent' as const
  }
]

const quarterHighlights = [
  {
    label: 'Bu Çeyrek',
    value: 'Marka bilinirliğini artırmak'
  },
  {
    label: 'Odak Müşteri',
    value: 'Perakende ve e-ticaret'
  },
  {
    label: 'Planlanan Kampanya',
    value: '12',
    helper: 'Her kampanya için en az 2 format'
  }
]

export default function HedeflerPage() {
  return (
    <div className="space-y-10 px-layout-x py-layout-y">
      {/* Section Header */}
      <SectionHeader
        title="Hedefler"
        subtitle="Bu çeyrek için odak noktalarınızı ve ilerlemenizi takip edin."
        badge="Performans"
        gradient
      />

      {/* Yol Haritası */}
      <Card title="Genel Yol Haritası" description="Bu dönem için belirlenen öncelikler.">
        <InfoGrid items={quarterHighlights} columns={3} />
      </Card>

      {/* KPI'lar */}
      <Card title="Ana Hedefler" description="İlerleme çubukları mevcut durumunuzu gösterir.">
        <ProgressList items={kpis} hidePercent />
      </Card>
    </div>
  )
}
