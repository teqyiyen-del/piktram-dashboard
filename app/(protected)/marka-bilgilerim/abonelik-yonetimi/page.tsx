'use client'

import { useState, useMemo } from 'react'
import { CreditCard, FileText, FileSignature, ArrowUpRight } from 'lucide-react'
import type { Subscription, StoredFile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

interface Props {
  subscription: Subscription | null
  invoices?: StoredFile[]
  contracts?: StoredFile[]
}

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currency}`
  }
}

export default function SubscriptionPanel({
  subscription,
  invoices = [],
  contracts = [],
}: Props) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  const planDetails = useMemo(() => {
    if (!subscription) {
      return {
        name: 'Tanımsız Plan',
        price: '—',
        renewal: 'Belirtilmedi',
        status: 'pasif',
      }
    }
    return {
      name: subscription.plan_name,
      price: formatCurrency(subscription.price, subscription.currency),
      renewal: subscription.renewal_date
        ? new Date(subscription.renewal_date).toLocaleDateString('tr-TR')
        : 'Belirtilmedi',
      status: subscription.status,
    }
  }, [subscription])

  return (
    <div className="space-y-8">
      {/* Abonelik Özeti */}
      <section className="rounded-2xl border bg-white dark:bg-surface-dark p-6 shadow-sm hover:shadow-md transition">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Abonelik Özeti
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Mevcut paket detaylarınızı görüntüleyin.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Paket</p>
                <p className="font-medium">{planDetails.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Ücret</p>
                <p className="font-medium">{planDetails.price}</p>
              </div>
              <div>
                <p className="text-gray-500">Yenilenme</p>
                <p className="font-medium">{planDetails.renewal}</p>
              </div>
              <div>
                <p className="text-gray-500">Durum</p>
                <p
                  className={`font-medium ${
                    planDetails.status === 'aktif'
                      ? 'text-green-600'
                      : planDetails.status === 'beklemede'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {planDetails.status}
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            className="gap-2 self-start"
            onClick={() => setUpgradeModalOpen(true)}
          >
            <ArrowUpRight className="h-4 w-4" />
            Paketi Yükselt
          </Button>
        </div>
      </section>

      {/* Faturalama */}
      <section>
        <h2 className="text-lg font-semibold">Faturalama</h2>
        <p className="mt-1 text-sm text-gray-500">Ödeme ve destek ayarları.</p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border p-5 shadow-sm bg-white dark:bg-surface-dark hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <CreditCard className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Otomatik Ödeme</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Kayıtlı kart ile aylık otomatik tahsilat yapılır.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-5 shadow-sm bg-white dark:bg-surface-dark hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <FileText className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Fatura Bildirimi</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Yeni fatura çıktığında e-posta gönderilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sözleşmeler */}
      <section>
        <h2 className="text-lg font-semibold">Sözleşmeler</h2>
        <p className="mt-1 text-sm text-gray-500">
          Abonelik sözleşmelerinizi buradan görüntüleyin.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {contracts.length === 0 ? (
            <p className="text-sm text-gray-500">Henüz sözleşme bulunmuyor.</p>
          ) : (
            contracts.map((file) => (
              <div
                key={file.id}
                className="rounded-2xl border p-5 shadow-sm bg-white dark:bg-surface-dark hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                    <FileSignature className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{file.name}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {file.created_at
                        ? new Date(file.created_at).toLocaleDateString('tr-TR')
                        : 'Tarih yok'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Faturalar */}
      <section>
        <h2 className="text-lg font-semibold">Faturalar</h2>
        <p className="mt-1 text-sm text-gray-500">
          Geçmiş faturalarınızı buradan görüntüleyin.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {invoices.length === 0 ? (
            <p className="text-sm text-gray-500">Henüz fatura bulunmuyor.</p>
          ) : (
            invoices.map((file) => (
              <div
                key={file.id}
                className="rounded-2xl border p-5 shadow-sm bg-white dark:bg-surface-dark hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{file.name}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {file.created_at
                        ? new Date(file.created_at).toLocaleDateString('tr-TR')
                        : 'Tarih yok'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Yükselt Modal */}
      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Paketi Yükselt"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Daha kapsamlı bir pakete geçmek için aşağıdaki özellikleri inceleyebilir ve talep oluşturabilirsiniz.
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
