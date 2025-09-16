'use client'

import { FormEvent, useState } from 'react'
import { Goal } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'

interface GoalFormProps {
  onSuccess: (goal: Goal) => void
  initialData?: Goal
}

export function GoalForm({ onSuccess, initialData }: GoalFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Hedef başlığı gerekli')
      toast({ title: 'İşlem başarısız', description: 'Hedef başlığı gerekli.', variant: 'error' })
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      title: trimmedTitle,
      description: description.trim() ? description.trim() : null
    }

    try {
      const response = await fetch(initialData ? `/api/goals/${initialData.id}` : '/api/goals', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? 'Bir hata oluştu')
        toast({ title: 'İşlem başarısız', description: data.error ?? 'Hedef kaydedilemedi.', variant: 'error' })
        return
      }

      const data = (await response.json()) as Goal

      toast({
        title: initialData ? 'Hedef güncellendi' : 'Hedef oluşturuldu',
        description: initialData ? 'Hedef detayları kaydedildi.' : 'Yeni hedef başarıyla eklendi.',
        variant: 'success'
      })

      onSuccess(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Hedef kaydedilemedi.'
      setError(message)
      toast({ title: 'İşlem başarısız', description: message, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Hedef Başlığı</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Örn. Haftalık raporu tamamla" required />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Açıklama</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          placeholder="Hedefin detaylarını paylaşın"
        ></textarea>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Kaydediliyor...' : initialData ? 'Hedefi Güncelle' : 'Hedef Oluştur'}
      </Button>
    </form>
  )
}
