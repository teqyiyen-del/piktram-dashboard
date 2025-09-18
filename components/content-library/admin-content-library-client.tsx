'use client'

import { FormEvent, useMemo, useState, type ComponentType } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import type { FileCategory, StoredFile } from '@/lib/types'
import { ImageIcon, LayoutGrid, Layers, Play, Sparkles, UploadCloud } from 'lucide-react'

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

interface AdminContentLibraryClientProps {
  initialAssets: AssetsState
}

export function AdminContentLibraryClient({ initialAssets }: AdminContentLibraryClientProps) {
  const supabase = useSupabaseClient<Database>()
  const [assets, setAssets] = useState<AssetsState>(initialAssets)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('logo')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const allAssets = useMemo(() => {
    return [...assets.logo, ...assets.post, ...assets.reel, ...assets.visual]
  }, [assets])

  const recentUploads = useMemo(() => {
    return [...allAssets]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
  }, [allAssets])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    window.setTimeout(() => setToast(null), 3000)
  }

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault()
    if (!file) {
      showToast('error', 'Lütfen bir dosya seçin')
      return
    }

    try {
      setUploading(true)
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Oturum bulunamadı')

      const config = categoryConfig[selectedCategory]
      const filePath = `${config.folder}/user-${user.id}-${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(filePath)

      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          bucket: 'brand-assets',
          path: filePath,
          url: publicUrlData.publicUrl,
          category: selectedCategory,
          description
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Dosya kaydedilemedi')
      }

      const created = (await response.json()) as StoredFile

      setAssets((prev) => ({
        ...prev,
        [selectedCategory]: [created, ...prev[selectedCategory]]
      }))

      setDescription('')
      setFile(null)
      setIsModalOpen(false)
      showToast('success', 'Dosya başarıyla yüklendi ✅')
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      {toast && (
        <div
          className={`fixed right-6 top-24 z-50 rounded-2xl px-4 py-3 text-sm shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      <Card
        title="İçerik Kütüphanesi (Admin)"
        description="Marka ekiplerinin yüklediği dosyaları yönetin ve yenilerini ekleyin."
        actions={
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-accent text-white hover:bg-accent/90"
          >
            <Sparkles className="h-4 w-4" />
            Yeni içerik yükle
          </Button>
        }
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {selectableCategories.map((category) => {
            const config = categoryConfig[category]
            const Icon = config.icon
            const count = assets[category]?.length ?? 0
            return (
              <div
                key={category}
                className="flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="space-y-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {config.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {config.description}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{count} varlık</span>
                  <Button
                    size="sm"
                    className="bg-accent text-white hover:bg-accent/90"
                  >
                    Klasörü aç
                  </Button>
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
          {recentUploads.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-500">
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
                  upload.url && (
                    <a
                      href={upload.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      İndir
                    </a>
                  )
                }
              />
            ))
          )}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni içerik yükle">
        <form className="space-y-4" onSubmit={handleUpload}>
          <div>
            <label className="text-sm font-medium text-gray-700">Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as AssetCategory)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            >
              {selectableCategories.map((option) => (
                <option key={option} value={option}>
                  {categoryConfig[option].title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Dosya</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-accent text-white hover:bg-accent/90"
            disabled={uploading}
          >
            {uploading ? 'Yükleniyor...' : 'Yükle'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
