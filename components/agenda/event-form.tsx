'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Event as CalendarEvent } from '@/lib/types'

interface EventFormProps {
  initialData?: CalendarEvent
  defaultDate?: Date
  onSuccess: (event: CalendarEvent, message: string) => void
}

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

  const submitLabel = useMemo(
    () => (initialData ? 'Görevi Güncelle' : 'Görev Oluştur'),
    [initialData]
  )

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!dateValue) {
      setError('Bitiş tarihi zorunludur')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const isoDate = new Date(dateValue).toISOString()
      const response = await fetch(initialData ? `/api/tasks/${initialData.id}` : '/api/tasks', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          due_date: isoDate,
          status: 'onaylandı' // Ajandada gözüksün diye direkt onaylı kaydediyoruz
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? 'Görev kaydedilemedi')
      }

      const savedTask = (await response.json()) as CalendarEvent
      onSuccess(savedTask, initialData ? 'Görev güncellendi' : 'Yeni görev oluşturuldu')
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Bir hata oluştu'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label>Başlık</label>
        <input
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
                     text-gray-900 placeholder:text-gray-400 
                     focus:border-accent focus:ring-accent 
                     hover:text-white dark:border-gray-700 dark:bg-surface-dark dark:text-gray-100"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Görev başlığı"
          required
        />
      </div>
      <div className="space-y-2">
        <label>Açıklama</label>
        <textarea
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
                     text-gray-900 placeholder:text-gray-400 
                     focus:border-accent focus:ring-accent 
                     hover:text-white dark:border-gray-700 dark:bg-surface-dark dark:text-gray-100"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          placeholder="Görev detayları"
        ></textarea>
      </div>
      <div className="space-y-2">
        <label>Bitiş Tarihi</label>
        <input
          type="datetime-local"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
                     text-gray-900 focus:border-accent focus:ring-accent 
                     hover:text-white dark:border-gray-700 dark:bg-surface-dark dark:text-gray-100"
          value={dateValue}
          onChange={(event) => setDateValue(event.target.value)}
          required
        />
      </div>
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 
                      dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Kaydediliyor...' : submitLabel}
      </Button>
    </form>
  )
}
