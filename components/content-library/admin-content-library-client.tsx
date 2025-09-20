'use client'

import { FormEvent, useMemo, useState, type ComponentType } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import type { FileCategory, StoredFile } from '@/lib/types'
import {
  ImageIcon,
  LayoutGrid,
  Layers,
  Play,
  Sparkles,
  UploadCloud,
  ArrowLeft,
  Trash2
} from 'lucide-react'

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
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null)
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editingFile, setEditingFile] = useState<StoredFile | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState<AssetCategory>('logo')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<StoredFile[]>([])

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
    if (!file) return showToast('error', 'Lütfen bir dosya seçin')

    try {
      setUploading(true)
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Oturum bulunamadı')

      const config = categoryConfig[selectedCategory ?? 'logo']
      const filePath = `${config.folder}/user-${user.id}-${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('brand-assets').getPublicUrl(filePath)

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
      if (!response.ok) throw new Error('DB kaydı başarısız')

      const created = (await response.json()) as StoredFile
      setAssets((prev) => ({
        ...prev,
        [selectedCategory ?? 'logo']: [created, ...prev[selectedCategory ?? 'logo']]
      }))

      setDescription('')
      setFile(null)
      setIsModalOpen(false)
      showToast('success', 'Dosya yüklendi ✅')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Yükleme hatası')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (file: StoredFile) => {
    try {
      await supabase.storage.from('brand-assets').remove([file.path])
      await fetch(`/api/files/${file.id}`, { method: 'DELETE' })

      setAssets((prev) => ({
        ...prev,
        [file.category as AssetCategory]: prev[file.category as AssetCategory].filter(
          (f) => f.id !== file.id
        )
      }))
      showToast('success', 'Dosya silindi 🗑️')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Silme hatası')
    }
  }

  const handleBulkDelete = async () => {
    try {
      const paths = selectedFiles.map((f) => f.path)
      const ids = selectedFiles.map((f) => f.id)

      await supabase.storage.from('brand-assets').remove(paths)
      await fetch(`/api/files/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })

      setAssets((prev) => {
        const newState = { ...prev }
        selectedFiles.forEach((f) => {
          newState[f.category as AssetCategory] = newState[f.category as AssetCategory].filter(
            (x) => x.id !== f.id
          )
        })
        return newState
      })

      setSelectedFiles([])
      showToast('success', 'Seçilen dosyalar silindi 🗑️')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Toplu silme hatası')
    }
  }

  const handleEdit = (file: StoredFile) => {
    setEditingFile(file)
    setEditDescription(file.description ?? '')
    setEditCategory(file.category as AssetCategory)
    setEditModalOpen(true)
  }

  const handleEditSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingFile) return

    try {
      const res = await fetch(`/api/files/${editingFile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: editDescription,
          category: editCategory
        })
      })
      if (!res.ok) throw new Error('Güncelleme başarısız')

      const updated = (await res.json()) as StoredFile
      setAssets((prev) => {
        const newState = { ...prev }
        newState[editingFile.category as AssetCategory] = prev[
          editingFile.category as AssetCategory
        ].filter((f) => f.id !== editingFile.id)
        newState[editCategory] = [updated, ...newState[editCategory]]
        return newState
      })
      setEditModalOpen(false)
      showToast('success', 'Dosya güncellendi ✏️')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Güncelleme hatası')
    }
  }

  const toggleSelectFile = (file: StoredFile) => {
    setSelectedFiles((prev) =>
      prev.find((f) => f.id === file.id) ? prev.filter((f) => f.id !== file.id) : [...prev, file]
    )
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
          <div className="flex gap-3">
            {selectedFiles.length > 0 && (
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" /> Seçilenleri Sil ({selectedFiles.length})
              </Button>
            )}
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-accent text-white hover:bg-accent/90"
            >
              <Sparkles className="h-4 w-4" />
              Yeni içerik yükle
            </Button>
          </div>
        }
      >
        {selectedCategory ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {categoryConfig[selectedCategory].title}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Geri dön
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {assets[selectedCategory].length === 0 ? (
                <p className="col-span-full text-sm text-gray-500 text-center py-10 border border-dashed rounded-xl">
                  Henüz içerik yok.
                </p>
              ) : (
                assets[selectedCategory].map((file) => {
                  const isImage = file.mimetype?.startsWith('image/')
                  const isVideo = file.mimetype?.startsWith('video/')
                  const isSelected = !!selectedFiles.find((f) => f.id === file.id)
                  return (
                    <div
                      key={file.id}
                      className={`rounded-xl border overflow-hidden shadow-sm transition relative ${
                        isSelected ? 'ring-2 ring-accent' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectFile(file)}
                        className="absolute top-3 left-3 z-10 h-4 w-4"
                      />
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        {isImage ? (
                          <img src={file.url || ''} alt={file.name} className="object-cover w-full h-full" />
                        ) : isVideo ? (
                          <video controls className="w-full h-full object-cover">
                            <source src={file.url || ''} type={file.mimetype || 'video/mp4'} />
                          </video>
                        ) : (
                          <UploadCloud className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-sm font-medium line-clamp-1">{file.name}</p>
                        <div className="flex items-center justify-between text-xs">
                          <a
                            href={file.url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-accent hover:underline"
                          >
                            İndir
                          </a>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(file)}>
                              Düzenle
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(file)}>
                              Sil
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {selectableCategories.map((category) => {
              const config = categoryConfig[category]
              const Icon = config.icon
              const count = assets[category]?.length ?? 0
              return (
                <div
                  key={category}
                  className="flex h-full flex-col justify-between rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="space-y-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">{config.title}</h3>
                      <p className="text-sm text-gray-500">{config.description}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-sm">
                    <span className="text-gray-500">{count} varlık</span>
                    <Button
                      size="sm"
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

      {/* Son Eklenenler */}
      <Card title="Son Eklenen Dosyalar" description="En güncel içerikleri görüntüleyin.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentUploads.length === 0 ? (
            <p className="rounded-2xl border border-dashed px-4 py-6 text-center text-xs text-gray-500">
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
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(upload)}>
                      Düzenle
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(upload)}>
                      Sil
                    </Button>
                  </div>
                }
              />
            ))
          )}
        </div>
      </Card>

      {/* Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni içerik yükle">
        <form className="space-y-4" onSubmit={handleUpload}>
          <div>
            <label className="text-sm font-medium">Kategori</label>
            <select
              value={selectedCategory ?? 'logo'}
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
            <label className="text-sm font-medium">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Dosya</label>
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

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Dosya düzenle">
        <form className="space-y-4" onSubmit={handleEditSave}>
          <div>
            <label className="text-sm font-medium">Kategori</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as AssetCategory)}
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
            <label className="text-sm font-medium">Açıklama</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" className="w-full bg-accent text-white hover:bg-accent/90">
            Kaydet
          </Button>
        </form>
      </Modal>
    </div>
  )
}
