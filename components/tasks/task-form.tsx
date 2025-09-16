'use client'

import { useState, FormEvent } from 'react'
import { Task } from '@/lib/types'
import { useToast } from '@/components/providers/toast-provider'
import { normalizeStatus, TASK_STATUS_ORDER, getStatusLabel } from '@/lib/task-status'
import { Button } from '@/components/ui/button'

interface TaskFormProps {
  onSuccess: (task: Task) => void
  projects: { id: string; title: string }[]
  initialData?: Task
}

export function TaskForm({ onSuccess, projects, initialData }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [status, setStatus] = useState<Task['status']>(initialData ? normalizeStatus(initialData.status) : 'todo')
  const [priority, setPriority] = useState<Task['priority']>(initialData?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(initialData?.due_date?.slice(0, 10) ?? '')
  const [projectId, setProjectId] = useState(initialData?.project_id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Görev başlığı gerekli')
      toast({ title: 'İşlem başarısız', description: 'Görev başlığı gerekli.', variant: 'error' })
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      title: trimmedTitle,
      description: description.trim() ? description.trim() : null,
      status,
      priority,
      due_date: dueDate ? dueDate : null,
      project_id: projectId || null
    }

    try {
      const response = await fetch(initialData ? `/api/tasks/${initialData.id}` : '/api/tasks', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? 'Bir hata oluştu')
        toast({ title: 'İşlem başarısız', description: data.error ?? 'Görev kaydedilemedi.', variant: 'error' })
        return
      }

      const data = (await response.json()) as Task
      const normalizedTask = { ...data, status: normalizeStatus(data.status) }

      toast({
        title: initialData ? 'Görev güncellendi' : 'Görev oluşturuldu',
        description: initialData
          ? 'Görev bilgileri başarıyla kaydedildi.'
          : 'Yeni göreviniz panoya eklendi.',
        variant: 'success'
      })
      onSuccess(normalizedTask)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Görev kaydedilemedi.'
      setError(message)
      toast({ title: 'İşlem başarısız', description: message, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Görev Başlığı</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Tasarım incelemesi" required />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Açıklama</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Görevin detayları"></textarea>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Durum</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])}>
            {TASK_STATUS_ORDER.map((taskStatus) => (
              <option key={taskStatus} value={taskStatus}>
                {getStatusLabel(taskStatus)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Öncelik</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])}>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Bitiş Tarihi</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">İlişkili Proje</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Proje seçin</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Kaydediliyor...' : initialData ? 'Görevi Güncelle' : 'Görev Oluştur'}
      </Button>
    </form>
  )
}
