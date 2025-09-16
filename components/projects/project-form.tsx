'use client'

import { useState, FormEvent } from 'react'
import { Project } from '@/lib/types'
import { Button } from '@/components/ui/button'
<<<<<<< HEAD

interface ProjectFormProps {
  initialData?: Project
  onSuccess: () => void
=======
import { useToast } from '@/components/providers/toast-provider'

interface ProjectFormProps {
  initialData?: Project
  onSuccess: (project: Project) => void
>>>>>>> codex-restore-ux
}

export function ProjectForm({ initialData, onSuccess }: ProjectFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [progress, setProgress] = useState(initialData?.progress ?? 0)
  const [dueDate, setDueDate] = useState(initialData?.due_date?.slice(0, 10) ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
<<<<<<< HEAD

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
=======
  const { toast } = useToast()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Proje başlığı gerekli')
      toast({ title: 'İşlem başarısız', description: 'Proje başlığı gerekli.', variant: 'error' })
      return
    }

>>>>>>> codex-restore-ux
    setLoading(true)
    setError(null)

    const payload = {
<<<<<<< HEAD
      title,
      description,
      progress,
      due_date: dueDate
    }

    const response = await fetch(initialData ? `/api/projects/${initialData.id}` : '/api/projects', {
      method: initialData ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    setLoading(false)

    if (!response.ok) {
      const data = await response.json()
      setError(data.error ?? 'Bir hata oluştu')
      return
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label>Proje Başlığı</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Mobil Uygulama Yenileme" required />
        </div>
        <div>
          <label>Açıklama</label>
          <textarea
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Projenin kısa açıklaması"
          ></textarea>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label>İlerleme (%)</label>
            <input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
          </div>
          <div>
            <label>Teslim Tarihi</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
      </div>
      {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
=======
      title: trimmedTitle,
      description: description?.trim() ? description.trim() : null,
      progress,
      due_date: dueDate ? dueDate : null
    }

    try {
      const response = await fetch(initialData ? `/api/projects/${initialData.id}` : '/api/projects', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? 'Bir hata oluştu')
        toast({ title: 'İşlem başarısız', description: data.error ?? 'Proje kaydedilemedi.', variant: 'error' })
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Proje kaydedilemedi.'
      setError(message)
      toast({ title: 'İşlem başarısız', description: message, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Proje Başlığı</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Mobil Uygulama Yenileme" required />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Açıklama</label>
        <textarea value={description ?? ''} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Projenin kısa açıklaması"></textarea>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">İlerleme (%)</label>
          <input type="number" min={0} max={100} value={progress} readOnly />
          <p className="mt-1 text-xs text-gray-500">Görev tamamlama durumuna göre otomatik hesaplanır.</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Teslim Tarihi</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
>>>>>>> codex-restore-ux
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Kaydediliyor...' : initialData ? 'Projeyi Güncelle' : 'Proje Oluştur'}
      </Button>
    </form>
  )
}
