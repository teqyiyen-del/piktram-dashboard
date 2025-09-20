'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDateTime } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export default function AnnouncementsPage() {
  const supabase = createClientComponentClient<Database>()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // form state (ekleme)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetUrl, setTargetUrl] = useState('')

  // düzenleme state
  const [openEdit, setOpenEdit] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [updating, setUpdating] = useState(false)

  // silme state
  const [openDelete, setOpenDelete] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // filtreleme & sıralama state
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'desc' | 'asc'>('desc')
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    fetchAnnouncements()
  }, [sort, page])

  async function fetchAnnouncements() {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, message, created_at')
      .order('created_at', { ascending: sort === 'asc' })
      .range(from, to)

    if (!error) setAnnouncements(data || [])
  }

  async function createAnnouncement() {
    if (!title || !message) return alert('Başlık ve mesaj boş olamaz!')
    setLoading(true)

    const { data: inserted, error } = await supabase
      .from('announcements')
      .insert({ title, message })
      .select('id')
      .single()

    if (!error) {
      await supabase.from('notifications').insert({
        title: `📢 Yeni Duyuru: ${title}`,
        description: message,
        type: 'announcement',
        target_url: targetUrl || '/duyurular',
        user_id: null,
        announcement_id: inserted?.id,
      })
      fetchAnnouncements()
    }

    setLoading(false)
    setOpen(false)
    setTitle('')
    setMessage('')
    setTargetUrl('')
  }

  async function updateAnnouncement() {
    if (!editId) return
    setUpdating(true)

    const { error } = await supabase
      .from('announcements')
      .update({ title: editTitle, message: editMessage })
      .eq('id', editId)

    if (!error) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === editId ? { ...a, title: editTitle, message: editMessage } : a
        )
      )
      setOpenEdit(false)
    }
    setUpdating(false)
  }

  async function deleteAnnouncement() {
    if (!deleteId) return
    setDeleting(true)

    await supabase.from('announcements').delete().eq('id', deleteId)
    await supabase.from('notifications').delete().eq('announcement_id', deleteId)

    setAnnouncements((prev) => prev.filter((a) => a.id !== deleteId))
    setDeleting(false)
    setOpenDelete(false)
  }

  // filtrelenmiş liste
  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-12">
      {/* Header */}
      <header
        className="flex items-center justify-between rounded-2xl p-6 text-white shadow-sm"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Duyurular</h1>
          <p className="mt-1 text-sm text-white/90">
            Tüm duyuruları görüntüleyin, düzenleyin veya yeni duyuru ekleyin.
          </p>
        </div>

        <Button
          disabled={loading}
          onClick={() => setOpen(true)}
          className="gap-2 bg-white text-[#FF5E4A] hover:bg-gray-100"
        >
          <PlusCircle className="h-4 w-4" />
          Yeni Duyuru
        </Button>
      </header>

      {/* Filtre & Sıralama */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Ara (başlık veya mesaj)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2">
          <Button
            variant={sort === 'desc' ? 'primary' : 'outline'}
            onClick={() => setSort('desc')}
          >
            En Yeni
          </Button>
          <Button
            variant={sort === 'asc' ? 'primary' : 'outline'}
            onClick={() => setSort('asc')}
          >
            En Eski
          </Button>
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            Henüz duyuru yok.
          </p>
        ) : (
          filtered.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{a.title}</h2>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(a.created_at)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditId(a.id)
                      setEditTitle(a.title)
                      setEditMessage(a.message)
                      setOpenEdit(true)
                    }}
                  >
                    Düzenle
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setDeleteId(a.id)
                      setOpenDelete(true)
                    }}
                  >
                    Sil
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-700">{a.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Sayfalama */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Önceki
        </Button>
        <span className="text-sm text-gray-600">Sayfa {page}</span>
        <Button
          variant="outline"
          disabled={announcements.length < pageSize}
          onClick={() => setPage((p) => p + 1)}
        >
          Sonraki
        </Button>
      </div>

      {/* Düzenle Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-md rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Duyuruyu Düzenle
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Başlık"
            />
            <Textarea
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              rows={4}
              placeholder="Mesaj"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Vazgeç
            </Button>
            <Button onClick={updateAnnouncement} disabled={updating}>
              {updating ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sil Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="max-w-sm rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Duyuru Silinsin mi?
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            Bu işlemi geri alamazsınız. Seçili duyuru kalıcı olarak silinecek.
          </p>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAnnouncement}
              disabled={deleting}
            >
              {deleting ? 'Siliniyor...' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
