'use client'

import { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { SectionHeader } from '@/components/layout/section-header'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const subNavigation = [
  {
    label: 'Abonelik Yönetimi',
    href: '/marka-bilgilerim/abonelik-yonetimi'
  },
  {
    label: 'Bilgilerim',
    href: '/marka-bilgilerim/bilgilerim'
  }
]

export default function MarkaBilgilerimLayout({ children }: { children: ReactNode }) {
  const [showModal, setShowModal] = useState(false)
  const [address, setAddress] = useState({ merkez: '', fatura: '', kargo: '' })
  const pathname = usePathname()

  const handleSave = () => {
    // TODO: Supabase update query
    console.log('Yeni adresler:', address)
    setShowModal(false)
  }

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Marka Bilgileri"
        subtitle="Abonelik, fatura ve adres detaylarınızı tek yerden takip edin."
        badge="Profilinizi Yönetin"
        gradient
        actions={
          <Button
            onClick={() => setShowModal(true)}
            variant="secondary"
            size="sm"
            className="rounded-full text-[#FF5E4A] font-semibold"
          >
            + Bilgilerimi Güncelle
          </Button>
        }
      />

      {/* 🔥 Bu sayfaya özel sekmeler */}
      <nav className="flex gap-4 rounded-2xl bg-white p-2 shadow-sm dark:bg-surface-dark">
        {subNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 rounded-xl px-8 py-3 text-center text-sm font-semibold transition 
                ${
                  isActive
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div>{children}</div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Adres Bilgilerini Güncelle"
      >
        <div className="space-y-5">
          {[
            { key: 'merkez', label: 'Merkez Ofis' },
            { key: 'fatura', label: 'Fatura Adresi' },
            { key: 'kargo', label: 'Kargo / Prodüksiyon' }
          ].map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </label>
              <input
                type="text"
                value={(address as any)[field.key]}
                onChange={(e) =>
                  setAddress({ ...address, [field.key]: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent focus:ring-accent dark:border-gray-600 dark:bg-surface-dark dark:text-gray-100"
                placeholder={`${field.label} girin`}
              />
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              İptal
            </Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
