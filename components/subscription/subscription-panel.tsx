'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, CreditCard, FileSignature, FileText, Inbox } from 'lucide-react'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { InfoGrid } from '@/components/ui/info-grid'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { StoredFile, Subscription } from '@/lib/types'

interface SubscriptionPanelProps {
  subscription: Subscription | null
  invoices: StoredFile[]
  contracts: StoredFile[]
}

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currency}`
  }
}

export function SubscriptionPanel({ subscription, invoices, contracts }: SubscriptionPanelProps) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  const planDetails = useMemo(() => {
    if (!subscription) {
      return [
        { label: 'Abonelik Durumu', value: 'Tanımlı plan bulunamadı', helper: 'Planınızı oluşturmak için destek ekibiyle iletişime geçin.' }
      ]
    }
    return [
      {
        label: 'Abone Olunan Paket',
        value: subscription.plan_name,
        helper: 'Piktram içerik ve raporlama hizmet paketi'
      },
      {
        label: 'Paket Fiyatı',
        value: formatCurrency(subscription.price, subscription.currency),
        helper: 'KDV dahil aylık ücret'
      },
      {
        label: 'Yenilenme Tarihi',
        value: subscription.renewal_date ? formatDate(subscription.renewal_date) : 'Belirtilmedi',
        helper: 'Yenileme öncesi e-posta ile hatırlatılır.'
      },
      {
        label: 'Hizmet Durumu',
        value: subscription.status === 'aktif' ? 'Aktif' : subscription.status === 'beklemede' ? 'Beklemede' : 'İptal edildi',
        helper: 'Durum değişiklikleri ekip tarafından izlenir.'
      }
    ]
  }, [subscription])

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-3">
        <Card
          title="Paket Özeti"
          description="Abonelik planınızın temel detaylarını inceleyin ve ihtiyaç halinde hızlıca yükseltme talebi oluşturun."
          actions={
            <Button type="button" variant="secondary" onClick={() => setUpgradeModalOpen(true)} className="gap-2">
              <ArrowUpRight className="h-4 w-4" /> Paketi Yükselt
            </Button>
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
              tag={subscription?.status === 'aktif' ? 'Etkin' : 'Pasif'}
              tagColor={subscription?.status === 'aktif' ? 'success' : 'warning'}
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
        <Card title="Faturalar" description="Fatura arşiviniz Supabase depolama ile senkronize edilir.">
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                Kayıtlı fatura bulunamadı.
              </p>
            ) : (
              invoices.map((invoice) => (
                <ListItem
                  key={invoice.id}
                  title={invoice.name}
                  description={invoice.description ?? 'Fatura kaydı'}
                  meta={`Eklenme: ${formatDate(invoice.created_at)}`}
                  icon={<FileText className="h-4 w-4" />}
                  rightSlot={
                    invoice.url ? (
                      <a
                        href={invoice.url}
                        className="text-xs font-semibold text-accent transition hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Görüntüle
                      </a>
                    ) : null
                  }
                />
              ))
            )}
          </div>
        </Card>

        <Card title="Sözleşmeler" description="İmzalı belgeleri ve ek sözleşmeleri tek noktadan takip edin.">
          <div className="space-y-4">
            {contracts.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                Kayıtlı sözleşme bulunamadı.
              </p>
            ) : (
              contracts.map((contract) => (
                <ListItem
                  key={contract.id}
                  title={contract.name}
                  description={contract.description ?? 'Sözleşme belgesi'}
                  meta={`Güncelleme: ${formatDate(contract.created_at)}`}
                  icon={<FileSignature className="h-4 w-4" />}
                  rightSlot={
                    contract.url ? (
                      <a
                        href={contract.url}
                        className="text-xs font-semibold text-accent transition hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        İndir
                      </a>
                    ) : null
                  }
                />
              ))
            )}
          </div>
        </Card>
      </div>

      <Modal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} title="Paket yükseltme talebi">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Piktram büyüme paketinden daha kapsamlı bir çözüme geçmek isterseniz müşteri başarı ekibimiz sizinle iletişime geçecektir.
          Mevcut paketinizi, hedeflerinizi ve bütçe detaylarını paylaşmanız yeterli.
        </p>
        <div className="mt-6 flex flex-col gap-3 text-sm text-gray-500 dark:text-gray-400">
          <p>• Premium raporlama modülleri</p>
          <p>• İçerik üretim kapasitesinin artırılması</p>
          <p>• Özel hesap yöneticisi desteği</p>
        </div>
        <Button className="mt-6 w-full" onClick={() => setUpgradeModalOpen(false)}>
          Talep oluşturuldu kabul et
        </Button>
      </Modal>
    </div>
  )
}
