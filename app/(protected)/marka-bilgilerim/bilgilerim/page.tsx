import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { InfoGrid } from '@/components/ui/info-grid'
import { Mail, MapPin, Phone, UserCircle2 } from 'lucide-react'

const companyInfo = [
  { label: 'Şirket Ünvanı', value: 'Piktram Dijital Çözümler A.Ş.' },
  { label: 'Vergi Numarası', value: '1234567890' },
  { label: 'Sektör', value: 'Dijital Pazarlama & İçerik Üretimi' }
]

const addressInfo = [
  { label: 'Merkez Ofis', value: 'İçerenköy Mah. Umut Sok. No:12/4, Ataşehir, İstanbul' },
  { label: 'Fatura Adresi', value: 'Rüzgarlıbahçe Mah. Kavak Sok. No:5, Beykoz, İstanbul' },
  { label: 'Kargo / Prodüksiyon', value: 'Maslak Mah. Eski Büyükdere Cd. No:24, Sarıyer, İstanbul' }
]

const contactInfo = [
  { label: 'Genel E-Posta', value: 'destek@piktram.com', helper: 'Tüm operasyonel talepler için ana iletişim adresi.' },
  { label: 'Müşteri Başarı', value: '+90 (212) 555 12 34', helper: 'Hafta içi 09:00 - 18:00 arasında canlı destek.' },
  { label: 'Basın & PR', value: 'iletisim@piktram.com', helper: 'Basın bülteni ve iş birliği talepleri.' }
]

const stakeholders = [
  {
    title: 'Marka Sorumlusu',
    description: 'Kampanya planlaması ve onay süreçlerinden sorumlu kişi.',
    meta: 'İsim: Elif Aksoy • Ünvan: Pazarlama Direktörü',
    icon: <UserCircle2 className="h-4 w-4" />
  },
  {
    title: 'Muhasebe Yetkilisi',
    description: 'Faturalama, sözleşme ve ödeme takip süreçleri.',
    meta: 'İsim: Murat Yılmaz • Ünvan: Finans Müdürü',
    icon: <UserCircle2 className="h-4 w-4" />
  }
]

export default function BilgilerimPage() {
  return (
    <div className="space-y-8">
      <Card
        title="Şirket Bilgileri"
        description="Kurumsal unvan ve kayıt bilgileriniz tüm ekiplerin erişebileceği şekilde listelenir."
      >
        <InfoGrid items={companyInfo} columns={3} />
      </Card>

      <Card
        title="Adres Bilgileri"
        description="Teslimatlar, etkinlikler ve saha çekimleri için güncel adresleriniz burada saklanır."
      >
        <InfoGrid items={addressInfo} columns={3} />
      </Card>

      <Card
        title="İletişim Kanalları"
        description="Ekibimiz tüm iletişim taleplerini bu bilgiler üzerinden koordine eder."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <InfoGrid
            items={contactInfo.map((contact) => ({
              label: contact.label,
              value: contact.value,
              helper: contact.helper
            }))}
            columns={1}
            className="md:col-span-1"
          />
          <div className="space-y-4 rounded-3xl border border-dashed border-gray-300 bg-gray-50/70 p-6 text-sm text-gray-600 transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
            <p className="flex items-center gap-2 font-semibold">
              <Mail className="h-4 w-4" />
              Ekip ile paylaş
            </p>
            <p>
              İlgili ekip arkadaşlarınızı buraya ekleyerek iletişim bilgilerinin güncelliğini garanti altına alın. Supabase entegrasyonu ile paylaşım listeleri otomatik olarak doldurulacaktır.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +90 (216) 444 00 11
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> İstanbul | Londra | Berlin ofisleri
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Ana Paydaşlar" description="Güncel sorumluların iletişim bilgilerini hızlıca bulun.">
        <div className="grid gap-4 md:grid-cols-2">
          {stakeholders.map((stakeholder) => (
            <ListItem
              key={stakeholder.title}
              title={stakeholder.title}
              description={stakeholder.description}
              meta={stakeholder.meta}
              icon={stakeholder.icon}
              tone="emerald"
              tag="Aktif"
              tagColor="success"
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
