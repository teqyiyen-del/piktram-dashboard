import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { Announcement } from '@/lib/types'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

const announcements: Announcement[] = [
  {
    id: '1',
    title: 'Haziran içerik planı güncellendi',
    description: 'Yeni ürün lansmanı için Instagram ve LinkedIn gönderileri ajandaya eklendi. Görseller revize bekliyor.',
    date: new Date().toISOString(),
    category: 'guncelleme',
    highlighted: true
  },
  {
    id: '2',
    title: 'Toplantı hatırlatması',
    description: 'Müşteriyle aylık performans toplantısı 11:00’de Zoom üzerinden gerçekleştirilecek.',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    category: 'hatirlatma'
  },
  {
    id: '3',
    title: 'Blog içeriği yayına alındı',
    description: '“Dijital PR’da 2024 Trendleri” başlıklı makale başarıyla yayınlandı. Sosyal medya dağıtımı planına eklendi.',
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    category: 'genel'
  }
]

const categoryConfig: Record<
  Announcement['category'],
  { label: string; tone: 'accent' | 'blue' | 'emerald' | 'amber' | 'violet'; tagColor: 'accent' | 'info' | 'warning' | 'success' }
> = {
  guncelleme: { label: 'Güncelleme', tone: 'accent', tagColor: 'accent' },
  hatirlatma: { label: 'Hatırlatma', tone: 'amber', tagColor: 'warning' },
  genel: { label: 'Genel Duyuru', tone: 'blue', tagColor: 'info' },
  kampanya: { label: 'Kampanya', tone: 'emerald', tagColor: 'success' }
}

const formatAnnouncementDate = (date: string) =>
  format(new Date(date), 'd MMMM yyyy • HH:mm', { locale: tr })

export default function DuyurularPage() {
  const pinned = announcements.filter((item) => item.highlighted)

  return (
    <div className="space-y-10">
      {/* Turuncu accent header */}
      <div
        className="rounded-2xl p-6 text-white shadow-sm"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <h1 className="text-xl md:text-2xl font-semibold">Duyurular</h1>
        <p className="mt-1 text-sm text-white/90">
          Takım içi bildirimleri ve sizinle paylaşılan notları buradan
          görüntüleyebilirsiniz.
        </p>
      </div>

      {/* Genel Duyuru Akışı */}
      <Card title="Duyuru Akışı" description="Tüm duyuruların listesi">
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Henüz duyuru eklenmedi.
            </p>
          ) : (
            announcements.map((announcement) => {
              const config = categoryConfig[announcement.category]
              return (
                <ListItem
                  key={announcement.id}
                  icon={<span className="text-lg">🔔</span>}
                  title={announcement.title}
                  description={announcement.description}
                  meta={formatAnnouncementDate(announcement.date)}
                  tag={config.label}
                  tagColor={config.tagColor}
                  tone={config.tone}
                  compact
                  rightSlot={
                    announcement.highlighted ? (
                      <span className="pill bg-white/80 text-accent dark:bg-surface-dark/80">
                        Öne Çıkan
                      </span>
                    ) : null
                  }
                />
              )
            })
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
            pinned.map((announcement) => {
              const config = categoryConfig[announcement.category]
              return (
                <ListItem
                  key={`pin-${announcement.id}`}
                  icon={<span className="text-lg">📌</span>}
                  title={announcement.title}
                  description={announcement.description}
                  meta={formatAnnouncementDate(announcement.date)}
                  tag={config.label}
                  tagColor={config.tagColor}
                  tone={config.tone}
                  compact
                />
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
