'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { Announcement } from '@/lib/types'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Bell } from 'lucide-react'
import { SectionHeader } from '@/components/layout/section-header'

const formatAnnouncementDate = (date: string | null | undefined) => {
  if (!date) return 'Tarih yok'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Geçersiz tarih'
  return format(d, 'd MMMM yyyy • HH:mm', { locale: tr })
}

export default function DuyurularPage() {
  const supabase = createClientComponentClient<Database>()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, message, created_at')
          .order('created_at', { ascending: false })

        if (error) throw error
        // Announcement tipinde description bekleniyordu → message'ı map’le
        const mapped = (data || []).map((a) => ({
          id: a.id,
          title: a.title,
          description: a.message,
          created_at: a.created_at,
        }))
        setAnnouncements(mapped)
      } catch (err) {
        console.error('Duyurular alınamadı:', err)
      } finally {
        setLoading(false)
      }
    }

    void fetchAnnouncements()
  }, [supabase])

  return (
    <div className="space-y-10 px-layout-x py-layout-y">
      {/* Section Header */}
      <SectionHeader
        title="Duyurular"
        subtitle="Şirketimizle ilgili en son haberler ve güncellemeler."
        badge="Genel"
        gradient
      />

      {/* Genel Duyuru Akışı */}
      <Card title="Duyuru Akışı">
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Yükleniyor...
            </p>
          ) : announcements.length === 0 ? (
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
                meta={formatAnnouncementDate(announcement.created_at)}
                compact
              />
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
