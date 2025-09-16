import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { ImageIcon, LayoutGrid, Layers, Play, Sparkles } from 'lucide-react'

const categories = [
  {
    title: 'Logolar & Kurumsal Kimlik',
    description: 'Vektörel logo paketleri, renk kodları ve kullanım rehberleri.',
    assetCount: 18,
    icon: Layers,
    actionLabel: 'Marka rehberini aç'
  },
  {
    title: 'Sosyal Medya Postları',
    description: 'Instagram, LinkedIn ve Twitter şablonları tek yerde.',
    assetCount: 42,
    icon: LayoutGrid,
    actionLabel: 'Tasarımları yönet'
  },
  {
    title: 'Reels Videoları',
    description: 'Dikey formatta kısa video içerik arşivi.',
    assetCount: 12,
    icon: Play,
    actionLabel: 'Galeriye git'
  },
  {
    title: 'Görsel Bankası',
    description: 'Ürün çekimleri, etkinlik fotoğrafları ve stok görseller.',
    assetCount: 65,
    icon: ImageIcon,
    actionLabel: 'Klasörleri incele'
  }
]

const recentUploads = [
  {
    title: 'Mart Kampanya Kapak Görseli',
    description: 'Sosyal medya postu • PNG',
    meta: 'Yükleyen: Ayşe Demir • 12 Şubat 2024',
    tone: 'violet' as const
  },
  {
    title: 'Kurumsal Logo - Beyaz Versiyon',
    description: 'Logo paketi • SVG',
    meta: 'Yükleyen: Tolga Kılıç • 09 Şubat 2024',
    tone: 'accent' as const
  },
  {
    title: 'Ürün Lansman Reels',
    description: 'Video içerik • MP4',
    meta: 'Yükleyen: Elif Aksoy • 04 Şubat 2024',
    tone: 'emerald' as const
  }
]

export default function IcerikKutuphanePage() {
  return (
    <div className="space-y-8">
      <Card
        title="İçerik Kütüphanesi"
        description="Marka ekiplerinin ihtiyaç duyduğu tüm medya varlıkları Supabase depolama ile entegre edildiğinde otomatik olarak senkronize edilecektir."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ff4d36]"
          >
            <Sparkles className="h-4 w-4" /> Yeni içerik yükle
          </button>
        }
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <div
                key={category.title}
                className="flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg duration-300 dark:border-gray-700 dark:bg-gray-900/60"
              >
                <div className="space-y-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{category.assetCount} varlık</span>
                  <button
                    type="button"
                    className="text-sm font-semibold text-accent transition hover:text-[#ff4d36]"
                  >
                    {category.actionLabel}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card
        title="Son Eklenen Dosyalar"
        description="Takım arkadaşlarınız tarafından paylaşılan en güncel içerikleri görüntüleyin."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentUploads.map((upload) => (
            <ListItem
              key={upload.title}
              title={upload.title}
              description={upload.description}
              meta={upload.meta}
              tone={upload.tone}
              icon={<Sparkles className="h-4 w-4" />}
              tag="Yeni"
              tagColor="accent"
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
