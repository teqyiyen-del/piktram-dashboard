import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { Announcement } from '@/lib/types'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Bell, Pin } from 'lucide-react'
import { SectionHeader } from '@/components/layout/section-header'

const announcements: Announcement[] = [
  {
    id: '1',
    title: 'Haziran içerik planı güncellendi',
    description:
      "Yeni ürün lansmanı için Instagram ve LinkedIn gönderileri ajandaya eklendi. Görseller revize bekliyor.",
    date: new Date().toISOString(),
    highlighted: true,
  },
  {
    id: '2',
    title: 'Toplantı hatırlatması',
    description:
      "Müşteriyle aylık performans toplantısı 11:00’de Zoom üzerinden gerçekleştirilecek.",
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
  },
  {
    id: '3',
    title: 'Blog içeriği yayına alındı',
    description:
      '"Dijital PR’da 2024 Trendleri" başlıklı makale başarıyla yayınlandı. Sosyal medya dağıtımı planına eklendi.',
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
  },
]

const formatAnnouncementDate = (date: string) =>
  format(new Date(date), 'd MMMM yyyy • HH:mm', { locale: tr })

export default function DuyurularPage() {
  const pinned = announcements.filter((item) => item.highlighted)

  return (
    <div className="space-y-10 px-layout-x py-layout-y">
      {/* Section Header (standart hero gibi gradientli) */}
      <SectionHeader
        title="Duyurular"
        subtitle="Takım içi bildirimleri ve sizinle paylaşılan notları buradan görüntüleyebilirsiniz."
        badge="Genel"
        gradient
      />

      {/* Genel Duyuru Akışı */}
      <Card title="Duyuru Akışı" description="Tüm duyuruların listesi">
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Henüz duyuru eklenmedi.
            </p>
          ) : (
            announcements.map((announcement) => (
              <ListItem
                key={announcement.id}
                icon={
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                    <Bell className="h-4 w-4 text-white" />
                  </div>
                }
                title={announcement.title}
                description={announcement.description}
                meta={formatAnnouncementDate(announcement.date)}
                compact
                rightSlot={
                  announcement.highlighted ? (
                    <span className="pill bg-accent/10 text-accent">
                      Öne Çıkan
                    </span>
                  ) : null
                }
              />
            ))
          )}
        </div>
      </Card>

      {/* Sabitlenen Notlar */}
      <Card title="Sabitlenen Notlar" description="Önemli sabitlenmiş duyurular">
        <div className="space-y-3">
          {pinned.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Şu anda sabitlenmiş duyuru yok.
            </p>
          ) : (
            pinned.map((announcement) => (
              <ListItem
                key={`pin-${announcement.id}`}
                icon={
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                    <Pin className="h-4 w-4 text-white" />
                  </div>
                }
                title={announcement.title}
                description={announcement.description}
                meta={formatAnnouncementDate(announcement.date)}
                compact
              />
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
