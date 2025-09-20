'use client'

import { useState, FormEvent } from 'react'
import { Project } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'

interface ProjectFormProps {
  initialData?: Project
  onSuccess: (project: Project) => void
}

export function ProjectForm({ initialData, onSuccess }: ProjectFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [progress] = useState(initialData?.progress ?? 0) // progress readonly olacak
  const [dueDate, setDueDate] = useState(initialData?.due_date?.slice(0, 10) ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError('Proje başlığı gerekli')
      toast({
        title: 'İşlem başarısız',
        description: 'Proje başlığı gerekli.',
        variant: 'error'
      })
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      title: trimmedTitle,
      description: description?.trim() ? description.trim() : null,
      progress,
      due_date: dueDate || null
    }

    try {
      const response = await fetch(
        initialData ? `/api/projects/${initialData.id}` : '/api/projects',
        {
          method: initialData ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const data = await response.json()
        const msg = data.error ?? 'Bir hata oluştu'
        setError(msg)
        toast({
          title: 'İşlem başarısız',
          description: msg,
          variant: 'error'
        })
        return
      }

      const data = (await response.json()) as Project

      toast({
        title: initialData ? 'Proje güncellendi' : 'Proje oluşturuldu',
        description: initialData
          ? 'Proje detayları başarıyla güncellendi.'
          : 'Yeni projeniz yönetim paneline eklendi.',
        variant: 'success'
      })

      onSuccess(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Proje kaydedilemedi.'
      setError(msg)
      toast({
        title: 'İşlem başarısız',
        description: msg,
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Proje Başlığı</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn. Mobil Uygulama Yenileme"
            required
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Açıklama</label>
          <textarea
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Projenin kısa açıklaması"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">İlerleme (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={progress}
              readOnly
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800"
            />
            <p className="mt-1 text-xs text-gray-500">
              Görev tamamlama durumuna göre otomatik hesaplanır.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Teslim Tarihi</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Kaydediliyor...' : initialData ? 'Projeyi Güncelle' : 'Proje Oluştur'}
      </Button>
    </form>
  )
}
