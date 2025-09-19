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
        {
          label: 'Abonelik',
          value: 'Tanımlı plan yok',
          helper: 'Plan oluşturmak için destek ekibimizle iletişime geçin.'
        }
      ]
    }
    return [
      {
        label: 'Paket',
        value: subscription.plan_name,
        helper: 'Aktif hizmet paketi'
      },
      {
        label: 'Ücret',
        value: formatCurrency(subscription.price, subscription.currency),
        helper: 'KDV dahil aylık fiyat'
      },
      {
        label: 'Yenilenme',
        value: subscription.renewal_date ? formatDate(subscription.renewal_date) : 'Belirtilmedi',
        helper: 'Yenileme öncesi e-posta ile bilgilendirme yapılır.'
      },
      {
        label: 'Durum',
        value:
          subscription.status === 'aktif'
            ? 'Aktif'
            : subscription.status === 'beklemede'
            ? 'Beklemede'
            : 'İptal edildi',
        helper: 'Durum değişiklikleri kaydedilir.'
      }
    ]
  }, [subscription])

  return (
    <div className="space-y-8">
      {/* Paket Özeti */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card
          title="Paket Özeti"
          description="Mevcut abonelik detaylarınız."
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={() => setUpgradeModalOpen(true)}
              className="gap-2"
            >
              <ArrowUpRight className="h-4 w-4" /> Yükselt
            </Button>
          }
          className="xl:col-span-2"
        >
          <InfoGrid items={planDetails} columns={2} />
        </Card>

        <Card
          title="Faturalama"
          description="Ödeme ve destek ayarları."
        >
          <div className="space-y-4">
            <ListItem
              title="Otomatik Ödeme"
              description="Kayıtlı kart ile aylık otomatik tahsilat yapılır."
              icon={<CreditCard className="h-4 w-4" />}
              tag={subscription?.status === 'aktif' ? 'Etkin' : 'Pasif'}
              tagColor={subscription?.status === 'aktif' ? 'success' : 'warning'}
            />
            <ListItem
              title="Fatura Bildirimi"
              description="Yeni fatura çıktığında e-posta gönderilir."
              icon={<Inbox className="h-4 w-4" />}
              tone="accent"
            />
          </div>
        </Card>
      </div>

      {/* Faturalar & Sözleşmeler */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Faturalar" description="Geçmiş faturalarınız.">
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                Henüz fatura bulunmuyor.
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

        <Card title="Sözleşmeler" description="İmzalanan belgeler.">
          <div className="space-y-4">
            {contracts.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                Henüz sözleşme bulunmuyor.
              </p>
            ) : (
              contracts.map((contract) => (
                <ListItem
                  key={contract.id}
                  title={contract.name}
                  description={contract.description ?? 'Sözleşme'}
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

      {/* Modal */}
      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Paket Yükselt"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Daha kapsamlı bir pakete geçmek isterseniz ekibimiz sizinle iletişime geçecektir.
        </p>
        <div className="mt-6 flex flex-col gap-3 text-sm text-gray-500 dark:text-gray-400">
          <p>• Premium raporlama</p>
          <p>• Daha yüksek içerik kapasitesi</p>
          <p>• Özel hesap yöneticisi</p>
        </div>
        <Button className="mt-6 w-full" onClick={() => setUpgradeModalOpen(false)}>
          Talep Oluştur
        </Button>
      </Modal>
    </div>
  )
}
