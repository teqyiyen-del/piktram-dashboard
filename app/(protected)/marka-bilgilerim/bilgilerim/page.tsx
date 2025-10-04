import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { InfoGrid } from '@/components/ui/info-grid'
import { Mail, MapPin, Phone, UserCircle2 } from 'lucide-react'

const companyInfo = [
  { label: 'Ünvan', value: 'Piktram Dijital Çözümler A.Ş.' },
  { label: 'Vergi No', value: '1234567890' },
  { label: 'Sektör', value: 'Dijital Pazarlama' }
]

const addressInfo = [
  { label: 'Merkez Ofis', value: 'İçerenköy Mah. Umut Sok. No:12/4, Ataşehir, İstanbul' },
  { label: 'Fatura Adresi', value: 'Rüzgarlıbahçe Mah. Kavak Sok. No:5, Beykoz, İstanbul' },
  { label: 'Kargo/Prodüksiyon', value: 'Maslak Mah. Eski Büyükdere Cd. No:24, Sarıyer, İstanbul' }
]

const contactInfo = [
  { label: 'E-Posta', value: 'info@piktram.com', },
  { label: 'Müşteri Destek', value: '+90 (541) 129 09 04', helper: 'Hafta içi 09:00 - 18:00' },
  { label: 'Sosyal Medya Hesaplarımız', value: '@piktram', helper: 'LinkedIn - Instagram - X' }
]

const stakeholders = [
  {
    title: 'Marka Sorumlusu',
    description: 'Kampanya ve onay süreçlerinden sorumlu.',
    meta: 'Elif Aksoy • Pazarlama Direktörü',
    icon: <UserCircle2 className="h-4 w-4" />
  },
  {
    title: 'Muhasebe Yetkilisi',
    description: 'Fatura ve ödeme süreçlerini yönetir.',
    meta: 'Murat Yılmaz • Finans Müdürü',
    icon: <UserCircle2 className="h-4 w-4" />
  }
]

export default function BilgilerimPage() {
  return (
    <div className="space-y-8">
      <Card title="Şirket Bilgileri" description="Temel kurumsal bilgileriniz.">
        <InfoGrid items={companyInfo} columns={3} />
      </Card>

      <Card title="Adresler" description="Merkez ve fatura adresleriniz.">
        <InfoGrid items={addressInfo} columns={3} />
      </Card>

      <Card title="İletişim" description="Bize ulaşabileceğiniz kanallar.">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoGrid
            items={contactInfo.map((c) => ({
              label: c.label,
              value: c.value,
              helper: c.helper
            }))}
            columns={1}
            className="md:col-span-1"
          />
          <div className="space-y-4 rounded-3xl border border-dashed border-gray-300 bg-orange-50/80 p-6 text-sm text-gray-700 dark:border-gray-700 dark:bg-surface-dark/40 dark:text-gray-300">
            <p className="flex items-center gap-2 font-semibold text-accent">
              <Mail className="h-4 w-4" />
              Ekip Paylaşımı
            </p>
            <p className="text-sm">
              Bu bilgileri ekip arkadaşlarınızla paylaşarak güncelliğini koruyun.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +90 (216) 444 00 11
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> İstanbul | Londra | Berlin
              </p>
            </div>
          </div>
        </div>
      </Card>

<Card title="Marka sorumluları" description="Güncel sorumlular.">
  <div className="grid gap-4 md:grid-cols-2">
    {stakeholders.map((s) => (
      <div
        key={s.title}
        className="flex items-start gap-4 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-surface-dark"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
          {s.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {s.title}
          </h3>
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
            {s.description}
          </p>
          <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            {s.meta}
          </p>
        </div>
      </div>
    ))}
  </div>
</Card>
    </div>
  )
}
