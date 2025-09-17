'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDateTime } from '@/lib/utils'

export default function AnnouncementsPage() {
  const supabase = createClientComponentClient<Database>()
  const [announcements, setAnnouncements] = useState<any[]>([])

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    const { data } = await supabase
      .from('announcements')
      .select('id, title, message, created_at, profiles(full_name, email)')
      .order('created_at', { ascending: false })
    setAnnouncements(data || [])
  }

  async function createAnnouncement() {
    const title = prompt('Duyuru başlığı girin:')
    const message = prompt('Duyuru mesajı girin:')
    if (!title || !message) return

    const { error } = await supabase.from('announcements').insert({
      title,
      message
    })

    if (error) {
      alert('Duyuru eklenemedi: ' + error.message)
    } else {
      fetchAnnouncements()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Duyurular</h1>
        <button
          onClick={createAnnouncement}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80"
        >
          + Duyuru Ekle
        </button>
      </div>

      {/* Liste */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz duyuru yok.</p>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{a.title}</h2>
                <span className="text-xs text-gray-500">
                  {formatDateTime(a.created_at)}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{a.message}</p>
              <p className="mt-2 text-xs text-gray-500">
                Gönderen: {a.profiles?.full_name ?? a.profiles?.email ?? 'Bilinmiyor'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
