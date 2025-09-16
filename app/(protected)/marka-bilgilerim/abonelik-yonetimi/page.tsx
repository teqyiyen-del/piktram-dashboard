import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { InfoGrid } from '@/components/ui/info-grid'
import { ArrowUpRight, CreditCard, FileSignature, FileText, Inbox } from 'lucide-react'

const planDetails = [
  {
    label: 'Abone Olunan Paket',
    value: 'Piktram Büyüme',
    helper: 'Sosyal medya + içerik stratejisi + raporlama'
  },
  {
    label: 'Paket Fiyatı',
    value: '₺8.750 / ay',
    helper: 'Yıllık ödeme planında %10 indirim uygulanır.'
  },
  {
    label: 'Yenilenme Tarihi',
    value: '12 Mayıs 2024',
    helper: 'Yenileme öncesi 7 gün kala bilgilendirme yapılır.'
  },
  {
    label: 'Hizmet Durumu',
    value: 'Aktif',
    helper: 'Otomatik yenileme açık.'
  }
]

const invoices = [
  {
    id: 'INV-2024-02',
    period: 'Şubat 2024',
    amount: '₺8.750',
    link: '#',
    issuedAt: '02 Şubat 2024'
  },
  {
    id: 'INV-2024-01',
    period: 'Ocak 2024',
    amount: '₺8.750',
    link: '#',
    issuedAt: '02 Ocak 2024'
  },
  {
    id: 'INV-2023-12',
    period: 'Aralık 2023',
    amount: '₺8.750',
    link: '#',
    issuedAt: '02 Aralık 2023'
  }
]

const contracts = [
  {
    name: 'Piktram Hizmet Sözleşmesi',
    version: 'v2.1',
    updatedAt: '01 Ocak 2024',
    link: '#'
  },
  {
    name: 'KVKK Aydınlatma Metni',
    version: 'v1.4',
    updatedAt: '15 Kasım 2023',
    link: '#'
  }
]

export default function AbonelikYonetimiPage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-3">
        <Card
          title="Paket Özeti"
          description="Abonelik planınızın temel detaylarını inceleyin ve ihtiyaç halinde hızlıca yükseltme yapın."
          actions={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-accent shadow-sm transition hover:bg-white/90"
            >
              <ArrowUpRight className="h-4 w-4" /> Paketi Yükselt
            </button>
          }
          className="xl:col-span-2"
        >
          <InfoGrid items={planDetails} columns={2} />
        </Card>

        <Card title="Faturalama & Destek" description="Ödeme yöntemleri ve destek taleplerinizi buradan yönetebilirsiniz.">
          <div className="space-y-4">
            <ListItem
              title="Otomatik Ödeme"
              description="Kayıtlı kredi kartı ile her ay otomatik tahsilat yapılır."
              icon={<CreditCard className="h-4 w-4" />}
              tag="Etkin"
              tone="emerald"
              tagColor="success"
            />
            <ListItem
              title="Faturalandırma Bildirimi"
              description="Yeni fatura oluştuğunda muhasebe ekibine e-posta gönderilir."
              icon={<Inbox className="h-4 w-4" />}
              tone="violet"
            />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Faturalar"
          description="Fatura arşiviniz Supabase depolama ile entegre edildiğinde dosyalara buradan erişebilirsiniz."
        >
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <ListItem
                key={invoice.id}
                title={invoice.period}
                description={`Fatura numarası: ${invoice.id}`}
                meta={`Kesim tarihi: ${invoice.issuedAt}`}
                icon={<FileText className="h-4 w-4" />}
                rightSlot={
                  <a
                    href={invoice.link}
                    className="text-xs font-semibold text-accent transition hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Görüntüle
                  </a>
                }
              />
            ))}
          </div>
        </Card>

        <Card
          title="Sözleşmeler"
          description="İmzalı belgeleri ve ek sözleşmeleri tek noktadan takip edin."
        >
          <div className="space-y-4">
            {contracts.map((contract) => (
              <ListItem
                key={contract.name}
                title={contract.name}
                description={`Versiyon: ${contract.version}`}
                meta={`Güncellendi: ${contract.updatedAt}`}
                icon={<FileSignature className="h-4 w-4" />}
                rightSlot={
                  <a
                    href={contract.link}
                    className="text-xs font-semibold text-accent transition hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    İndir
                  </a>
                }
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
