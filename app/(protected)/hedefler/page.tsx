'use client'

import { useState } from 'react'
import { Card } from '@/components/sections/card'
import { InfoGrid } from '@/components/ui/info-grid'
import { ProgressList } from '@/components/ui/progress-list'
import { Button } from '@/components/ui/button'

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
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-12">
      {/* Header */}
      <header
        className="rounded-2xl p-6 flex items-center justify-between text-white shadow-sm"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Hedefler</h1>
          <p className="mt-1 text-sm text-white/90">
            Bu çeyrek için odak noktalarınızı ve ilerlemenizi takip edin.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-white text-[#FF5E4A] hover:bg-gray-100"
        >
          + Yeni Hedef
        </Button>
      </header>

      {/* Yol Haritası */}
      <Card title="Genel Yol Haritası" description="Bu dönem için belirlenen öncelikler.">
        <InfoGrid items={quarterHighlights} columns={3} />
      </Card>

      {/* KPI'lar */}
      <Card title="Ana Hedefler" description="İlerleme çubukları mevcut durumunuzu gösterir.">
        <ProgressList items={kpis} />
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Yeni Hedef Ekle</h2>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Başlık"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Açıklama"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                type="date"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  İptal
                </Button>
                <Button
                  onClick={() => {
                    // Burada Supabase insert işlemini bağlayacaksın
                    alert('Hedef kaydedildi (dummy)')
                    setShowModal(false)
                  }}
                >
                  Kaydet
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
