'use client'

import { useMemo, useState, type ComponentType } from 'react'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { Button } from '@/components/ui/button'
import type { FileCategory, StoredFile } from '@/lib/types'
import { ImageIcon, LayoutGrid, Layers, Play, UploadCloud, ArrowLeft } from 'lucide-react'

type AssetCategory = Extract<FileCategory, 'logo' | 'post' | 'reel' | 'visual'>

const categoryConfig: Record<
  AssetCategory,
  { title: string; description: string; icon: ComponentType<any>; folder: string }
> = {
  logo: {
    title: 'Logolar & Kurumsal Kimlik',
    description: 'Vektörel logo paketleri, renk kodları ve kullanım rehberleri.',
    icon: Layers,
    folder: 'logolar'
  },
  post: {
    title: 'Sosyal Medya Postları',
    description: 'Instagram, LinkedIn ve X şablonları tek yerde.',
    icon: LayoutGrid,
    folder: 'postlar'
  },
  reel: {
    title: 'Reels Videoları',
    description: 'Dikey formatta kısa video içerik arşivi.',
    icon: Play,
    folder: 'reels'
  },
  visual: {
    title: 'Görsel Bankası',
    description: 'Ürün çekimleri, etkinlik fotoğrafları ve stok görseller.',
    icon: ImageIcon,
    folder: 'gorseller'
  }
}

const selectableCategories: AssetCategory[] = ['logo', 'post', 'reel', 'visual']

type AssetsState = Record<AssetCategory, StoredFile[]>

interface ContentLibraryClientProps {
  initialAssets: AssetsState
}

export function ContentLibraryClient({ initialAssets }: ContentLibraryClientProps) {
  const [assets] = useState<AssetsState>(initialAssets)
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null)

  const allAssets = useMemo(() => {
    return [...assets.logo, ...assets.post, ...assets.reel, ...assets.visual]
  }, [assets])

  const recentUploads = useMemo(() => {
    return [...allAssets]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
  }, [allAssets])

  return (
    <div className="space-y-8">
      <Card
        title="İçerik Kütüphanesi"
        description="Marka ekiplerinin ihtiyaç duyduğu tüm medya varlıkları Supabase depolama ile senkronize edilir."
      >
        {selectedCategory ? (
          <div className="space-y-6">
            {/* Geri dön + başlık */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {categoryConfig[selectedCategory].title}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Geri dön
              </Button>
            </div>

            {/* Dosya grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {assets[selectedCategory].length === 0 ? (
                <p className="col-span-full text-sm text-gray-500 dark:text-gray-400 text-center py-10 border border-dashed rounded-xl">
                  Henüz içerik yok.
                </p>
              ) : (
                assets[selectedCategory].map((file) => {
                  const isImage = file.mimetype?.startsWith('image/')
                  const isVideo = file.mimetype?.startsWith('video/')
                  return (
                    <div
                      key={file.id}
                      className="rounded-xl border border-gray-200 bg-white/80 dark:border-gray-700 dark:bg-gray-900/50 overflow-hidden shadow-sm hover:shadow-md transition"
                    >
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {isImage ? (
                          <img
                            src={file.url || ''}
                            alt={file.name}
                            className="object-cover w-full h-full"
                          />
                        ) : isVideo ? (
                          <video controls className="w-full h-full object-cover">
                            <source src={file.url || ''} type={file.mimetype || 'video/mp4'} />
                          </video>
                        ) : (
                          <UploadCloud className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="p-4 space-y-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                          {file.name}
                        </p>
                        <a
                          href={file.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-accent hover:underline"
                        >
                          İndir
                        </a>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {selectableCategories.map((category) => {
              const config = categoryConfig[category]
              const Icon = config.icon
              const count = assets[category]?.length ?? 0
              return (
                <div
                  key={category}
                  className="flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg duration-300 dark:border-gray-700 dark:bg-gray-900/60"
                >
                  <div className="space-y-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {config.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{count} varlık</span>
                    <Button
                      className="bg-accent text-white hover:bg-accent/90"
                      onClick={() => setSelectedCategory(category)}
                    >
                      Klasörü aç
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card
        title="Son Eklenen Dosyalar"
        description="Takım arkadaşlarınız tarafından paylaşılan en güncel içerikleri görüntüleyin."
      >
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {recentUploads.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
              Henüz içerik yüklenmedi.
            </p>
          ) : (
            recentUploads.map((upload) => (
              <ListItem
                key={upload.id}
                title={upload.name}
                description={upload.description ?? 'Dosya'}
                meta={`Kategori: ${
                  categoryConfig[upload.category as AssetCategory]?.title ?? 'Diğer'
                }`}
                icon={<UploadCloud className="h-4 w-4" />}
                rightSlot={
                  upload.url ? (
                    <a
                      href={upload.url}
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
  )
}
