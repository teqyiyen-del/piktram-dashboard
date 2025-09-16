import { ReactNode } from 'react'
import { SectionSubnav } from '@/components/layout/section-subnav'

const subNavigation = [
  {
    label: 'Abonelik Yönetimi',
    href: '/marka-bilgilerim/abonelik-yonetimi',
    description: 'Paket detayları, faturalar ve sözleşmeleri yönetin.'
  },
  {
    label: 'Bilgilerim',
    href: '/marka-bilgilerim/bilgilerim',
    description: 'Şirket, adres ve iletişim bilgilerinizi güncel tutun.'
  }
]

export default function MarkaBilgilerimLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF5E4A] via-[#FF704F] to-[#FF8469] p-10 text-white shadow-brand-card">
        <div className="absolute -left-10 top-6 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">Marka bilgileri</p>
          <h1 className="text-3xl font-semibold">Kurumsal Profilinizi Yönetin</h1>
          <p className="max-w-3xl text-sm text-white/85">
            Piktram aboneliğiniz ve marka bilgileriniz tek merkezde. Paketleri karşılaştırabilir, faturalarınıza ulaşabilir ve ekip iletişim bilgilerinizi güncel tutabilirsiniz.
          </p>
        </div>
      </section>

      <SectionSubnav items={subNavigation} />

      <div>{children}</div>
    </div>
  )
}
