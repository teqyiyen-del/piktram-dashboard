import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { CalendarClock, MessageCircle, Video } from 'lucide-react'

const upcomingMeetings = [
  {
    title: 'Aylık Performans Değerlendirmesi',
    description: 'Piktram ekibi ile aylık kampanya performansı ve raporlar',
    meta: '19 Şubat 2024 • 10:00 - 11:00 • Google Meet',
    tone: 'violet' as const
  },
  {
    title: 'İçerik Üretim Çalıştayı',
    description: 'Fin ekibi sorularınız için açık oturum',
    meta: '22 Şubat 2024 • 14:00 - 15:30 • Piktram Studio',
    tone: 'emerald' as const
  }
]

export default function ToplantiPlanlamaPage() {
  return (
    <div className="space-y-8">
      <Card
        title="Cal.com Entegrasyonu"
        description="Piktram toplantı takvimini Cal.com üzerinden senkronize ederek müşterilerinizin uygunluk durumuna göre otomatik randevu alın."
      >
        <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/80 p-10 text-center text-sm text-gray-600 transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
          <p className="text-lg font-semibold text-gray-800 dark:text-white">Cal.com iframe placeholder</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm">
            API anahtarınızı eklediğinizde Cal.com takviminiz burada gömülü olarak görüntülenecek. Otomatik hatırlatıcılar, saat dilimi desteği ve ekip üyelerine göre dağıtım gibi özellikler hazırdır.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-5 py-2 text-xs font-medium text-gray-500 shadow-sm dark:bg-gray-800/80">
            <CalendarClock className="h-4 w-4 text-accent" />
            Canlı entegrasyon yakında aktif olacak.
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Toplantı Talebi Oluştur"
          description="Sorularınız Fin ekibine iletilecek ve en uygun zaman dilimi size önerilecek."
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Soruları Fin varsa veya yeni bir içerik çalışması planlıyorsanız hızlıca toplantı talebinde bulunun. Supabase formları ile entegre edildiğinde talepler otomatik olarak kaydedilecek ve Cal.com slotlarına yansıyacak.
          </p>
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ff4d36]"
          >
            <MessageCircle className="h-4 w-4" /> Yeni toplantı talep et
          </button>
        </Card>

        <Card
          title="Yaklaşan Toplantılar"
          description="Planlanan görüşmeleri takip edin ve ekip üyeleriyle senkron kalın."
        >
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <ListItem
                key={meeting.title}
                title={meeting.title}
                description={meeting.description}
                meta={meeting.meta}
                tone={meeting.tone}
                icon={<Video className="h-4 w-4" />}
                tag="Takvimlendi"
                tagColor="info"
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
