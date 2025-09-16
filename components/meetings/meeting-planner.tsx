'use client'

import { FormEvent, useMemo, useState } from 'react'
import { CalendarClock, MessageCircle, Video } from 'lucide-react'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import type { Meeting } from '@/lib/types'
import { useNotificationCenter } from '@/components/providers/notification-provider'

interface MeetingPlannerProps {
  initialMeetings: Meeting[]
  calUrl?: string | null
}

export function MeetingPlanner({ initialMeetings, calUrl }: MeetingPlannerProps) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)
  const [title, setTitle] = useState('')
  const [agenda, setAgenda] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const { refresh: refreshNotifications } = useNotificationCenter()

  const sortedMeetings = useMemo(() => {
    return [...meetings].sort((a, b) => {
      const aTime = a.preferred_date ? new Date(a.preferred_date).getTime() : Number.MAX_SAFE_INTEGER
      const bTime = b.preferred_date ? new Date(b.preferred_date).getTime() : Number.MAX_SAFE_INTEGER
      return aTime - bTime
    })
  }, [meetings])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    window.setTimeout(() => setToast(null), 3200)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!title) {
      showToast('error', 'Lütfen toplantı başlığı girin')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          agenda,
          preferred_date: preferredDate ? new Date(preferredDate).toISOString() : null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Toplantı talebi oluşturulamadı')
      }

      const created = (await response.json()) as Meeting
      setMeetings((prev) => [created, ...prev])
      setTitle('')
      setAgenda('')
      setPreferredDate('')
      showToast('success', 'Toplantı talebiniz alındı')
      void refreshNotifications()
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {toast ? (
        <div
          className={`fixed right-6 top-24 z-50 min-w-[240px] rounded-2xl px-4 py-3 text-sm shadow-lg transition ${
            toast.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'border border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <Card
        title="Cal.com Entegrasyonu"
        description="Piktram toplantı takvimini Cal.com üzerinden senkronize ederek müşterilerinizin uygunluğuna göre otomatik randevu alın."
      >
        {calUrl ? (
          <iframe
            src={calUrl}
            title="Cal.com takvimi"
            className="h-[520px] w-full rounded-3xl border border-gray-200 shadow-sm dark:border-gray-700"
            allow="clipboard-write; fullscreen"
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/80 p-10 text-center text-sm text-gray-600 transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
            <p className="text-lg font-semibold text-gray-800 dark:text-white">Cal.com iframe hazır</p>
            <p className="mx-auto mt-2 max-w-2xl text-sm">
              API anahtarınızı eklediğinizde Cal.com takviminiz burada gömülü olarak görüntülenecek. Otomatik hatırlatıcılar, saat dilimi desteği ve ekip üyelerine göre dağıtım hazırdır.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-5 py-2 text-xs font-medium text-gray-500 shadow-sm dark:bg-gray-800/80">
              <CalendarClock className="h-4 w-4 text-accent" />
              Canlı entegrasyon kısa sürede aktif edilebilir.
            </div>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Toplantı Talebi Oluştur"
          description="Soruları Fin varsa veya yeni bir içerik çalışması planlıyorsanız hızlıca toplantı talebinde bulunun."
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Başlık</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Örn. Performans değerlendirmesi"
                className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Gündem</label>
              <textarea
                value={agenda}
                onChange={(event) => setAgenda(event.target.value)}
                rows={3}
                placeholder="Toplantıda konuşmak istediğiniz maddeler"
                className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Tercih edilen tarih</label>
              <input
                type="datetime-local"
                value={preferredDate}
                onChange={(event) => setPreferredDate(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              <MessageCircle className="h-4 w-4" /> {submitting ? 'Gönderiliyor...' : 'Toplantı talep et'}
            </Button>
          </form>
        </Card>

        <Card
          title="Yaklaşan Toplantılar"
          description="Planlanan görüşmeleri takip edin ve ekip üyeleriyle senkron kalın."
        >
          <div className="space-y-4">
            {sortedMeetings.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                Kaydedilmiş toplantı bulunmuyor.
              </p>
            ) : (
              sortedMeetings.map((meeting) => (
                <ListItem
                  key={meeting.id}
                  title={meeting.title}
                  description={meeting.agenda ?? 'Gündem belirtilmedi'}
                  meta={meeting.preferred_date ? formatDateTime(meeting.preferred_date) : 'Tarih belirlenmedi'}
                  icon={<Video className="h-4 w-4" />}
                  tag={meeting.status === 'onaylandi' ? 'Onaylandı' : meeting.status === 'planlandi' ? 'Takvimde' : 'Beklemede'}
                  tagColor={meeting.status === 'onaylandi' ? 'success' : meeting.status === 'planlandi' ? 'info' : 'warning'}
                />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
