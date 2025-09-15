'use client'

import { useState, FormEvent } from 'react'
import { Project } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface ProjectFormProps {
  initialData?: Project
  onSuccess: () => void
}

export function ProjectForm({ initialData, onSuccess }: ProjectFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [progress, setProgress] = useState(initialData?.progress ?? 0)
  const [dueDate, setDueDate] = useState(initialData?.due_date?.slice(0, 10) ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Proje Başlığı</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Mobil Uygulama Yenileme" required />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Açıklama</label>
        <textarea
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Projenin kısa açıklaması"
        ></textarea>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">İlerleme (%)</label>
          <input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teslim Tarihi</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Kaydediliyor...' : initialData ? 'Projeyi Güncelle' : 'Proje Oluştur'}
      </Button>
    </form>
  )
}
