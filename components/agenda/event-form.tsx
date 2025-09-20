'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { AgendaEventType, Event as CalendarEvent } from '@/lib/types'

interface EventFormProps {
  initialData?: CalendarEvent
  defaultDate?: Date
  onSuccess: (event: CalendarEvent, message: string) => void
}

const typeOptions: { value: AgendaEventType; label: string }[] = [
  { value: 'icerik', label: 'İçerik Teslimi' },
  { value: 'toplanti', label: 'Toplantı' },
  { value: 'odeme', label: 'Ödeme Hatırlatması' },
  { value: 'rapor', label: 'Rapor Teslimi' }
]

function formatInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function EventForm({ initialData, defaultDate, onSuccess }: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [eventType, setEventType] = useState<AgendaEventType>(initialData?.event_type ?? 'icerik')
  const [related, setRelated] = useState(initialData?.related ?? '')
  const [dateValue, setDateValue] = useState(() => {
    if (initialData?.event_date) {
      return formatInputValue(new Date(initialData.event_date))
    }
    if (defaultDate) {
      return formatInputValue(defaultDate)
    }
    return formatInputValue(new Date())
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitLabel = useMemo(() => (initialData ? 'Etkinliği Güncelle' : 'Etkinlik Oluştur'), [initialData])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!dateValue) {
      setError('Etkinlik tarihi zorunludur')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const isoDate = new Date(dateValue).toISOString()
      const response = await fetch(initialData ? `/api/events/${initialData.id}` : '/api/events', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          event_date: isoDate,
          event_type: eventType,
          related: related || null
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? 'Etkinlik kaydedilemedi')
      }

      const savedEvent = (await response.json()) as CalendarEvent
      onSuccess(savedEvent, initialData ? 'Etkinlik güncellendi' : 'Yeni etkinlik oluşturuldu')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label>Başlık</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Etkinlik başlığı" required />
      </div>
      <div className="space-y-2">
        <label>Açıklama</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          placeholder="Etkinlik detayları"
        ></textarea>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label>Etkinlik Türü</label>
          <select value={eventType} onChange={(event) => setEventType(event.target.value as AgendaEventType)}>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label>Tarih & Saat</label>
          <input type="datetime-local" value={dateValue} onChange={(event) => setDateValue(event.target.value)} required />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <label>İlgili Kayıt</label>
          <input
            value={related}
            onChange={(event) => setRelated(event.target.value)}
            placeholder="Örn. Proje adı veya toplantı linki"
          />
        </div>
      </div>
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Kaydediliyor...' : submitLabel}
      </Button>
    </form>
  )
}
