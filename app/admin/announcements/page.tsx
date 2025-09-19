'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDateTime } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AnnouncementsPage() {
  const supabase = createClientComponentClient<Database>()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, message, created_at, profiles(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) console.error('Duyurular alınamadı:', error.message)
    setAnnouncements(data || [])
  }

  async function createAnnouncement() {
    const title = prompt('Duyuru başlığı girin:')
    const message = prompt('Duyuru mesajı girin:')
    if (!title || !message) return

    setLoading(true)
    const { error } = await supabase.from('announcements').insert({
      title,
      message
    })
    setLoading(false)

    if (error) {
      alert('Duyuru eklenemedi: ' + error.message)
    } else {
      fetchAnnouncements()
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-12">
      {/* Header */}
      <header
        className="rounded-2xl p-6 flex items-center justify-between text-white shadow-sm"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Duyurular</h1>
          <p className="mt-1 text-sm text-white/90">
            Tüm duyuruları görüntüleyin veya yeni duyurular ekleyin.
          </p>
        </div>
        <Button
          onClick={createAnnouncement}
          disabled={loading}
          className="gap-2 bg-white text-[#FF5E4A] hover:bg-gray-100"
        >
          <PlusCircle className="h-4 w-4" />
          Yeni Duyuru
        </Button>
      </header>

      {/* Liste */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">Henüz duyuru yok.</p>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{a.title}</h2>
                <span className="text-xs text-gray-500">
                  {formatDateTime(a.created_at)}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{a.message}</p>
              <p className="mt-2 text-xs text-gray-400">
                Gönderen: {a.profiles?.full_name ?? a.profiles?.email ?? 'Bilinmiyor'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
